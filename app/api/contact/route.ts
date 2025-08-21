import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis and Rate Limiter
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(
      Number(process.env.RATE_LIMIT_REQUESTS || 3),
      (process.env.RATE_LIMIT_DURATION as "1 d") || "1 d"
    ),
  });
} else {
  console.warn("Upstash Redis environment variables not set. Rate limiting is disabled.");
}

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Apply rate limiting if configured
  if (ratelimit) {
    const ip = request.ip ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. You have ${remaining} requests left. Please try again after ${new Date(reset * 1000).toLocaleTimeString()}.` },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
        let { name, email, subject, message, recaptchaToken } = body;

    // Sanitize inputs
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    name = escapeHtml(name);
    email = escapeHtml(email);
    subject = escapeHtml(subject);
    message = escapeHtml(message);

    // Validate required fields
        if (!name || !email || !subject || !message || !recaptchaToken) {
      return NextResponse.json(
        { error: "All fields, including reCAPTCHA, are required" },
        { status: 400 }
      );
    }

    // Length validation
    if (name.length > 100 || email.length > 100 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json(
        { error: "Input fields exceed maximum length." },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (!recaptchaSecret) {
      console.error("reCAPTCHA secret key is not set.");
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`;

    const recaptchaResponse = await fetch(recaptchaUrl, { method: "POST" });
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("Email configuration missing");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "dan.koryat@gmail.com",
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Message sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}