import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(150),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  recaptchaToken: z.string().min(1, "Please complete the reCAPTCHA"),
});

// Built once per process rather than per request.
const ratelimit = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Upstash credentials absent — contact rate limiting disabled.");
    return null;
  }

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(
      Number(process.env.RATE_LIMIT_REQUESTS || 3),
      (process.env.RATE_LIMIT_DURATION as "1 d") || "1 d"
    ),
    analytics: true,
    prefix: "contact",
  });
})();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * The app runs behind Nginx and a Cloudflare Tunnel, so `request.ip` is the
 * proxy — every visitor would otherwise share a single rate-limit bucket.
 * Prefer the forwarded client address.
 */
function clientIp(request: NextRequest): string {
  const cloudflare = request.headers.get("cf-connecting-ip");
  if (cloudflare) return cloudflare;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return request.headers.get("x-real-ip") ?? request.ip ?? "unknown";
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function verifyRecaptcha(token: string, ip: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, configured: false };

  // Send credentials in the body — a query string can end up in access logs.
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip !== "unknown" ? { remoteip: ip } : {}),
      }),
    }
  );

  const data = (await response.json()) as { success?: boolean };
  return { ok: Boolean(data.success), configured: true };
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(ip);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: `Too many messages from this address. Please try again later, or email me directly.`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate first: escaping beforehand would corrupt the values being
    // checked (an apostrophe in an address becomes `&#039;` and fails).
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      // Zod reports a bare "Required" for missing keys — name the field so the
      // form can show something actionable.
      const error =
        issue?.message === "Required" && issue.path.length > 0
          ? `${String(issue.path[0])} is required`
          : issue?.message ?? "Invalid submission";

      return NextResponse.json({ error }, { status: 400 });
    }

    const { name, email, subject, message, recaptchaToken } = parsed.data;

    const recaptcha = await verifyRecaptcha(recaptchaToken, ip);
    if (!recaptcha.configured) {
      console.error("RECAPTCHA_SECRET_KEY is not set.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }
    if (!recaptcha.ok) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed. Please try again." },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email credentials missing.");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_TO_EMAIL || process.env.EMAIL_USER,
      // So replying in the mail client goes to the sender, not to myself.
      replyTo: `${name} <${email}>`,
      subject: `Portfolio Contact: ${subject}`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
