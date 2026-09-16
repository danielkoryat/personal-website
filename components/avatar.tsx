"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  /** Path to a photo in `public/`. Falls back to the monogram if absent. */
  src?: string;
  name: string;
  /** Rendered pixel size at the largest breakpoint, for `sizes` hints. */
  size?: number;
  priority?: boolean;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  src,
  name,
  size = 320,
  priority = false,
  className = "",
}: AvatarProps) {
  // If the photo is missing or fails to load we show the monogram rather than
  // a broken image, so the hero always renders something deliberate.
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-full ${className}`}
    >
      {showPhoto ? (
        <Image
          src={src as string}
          alt={`${name} — portrait`}
          fill
          sizes={`(max-width: 640px) 16rem, ${size}px`}
          priority={priority}
          // The source portrait is small, so keep re-compression light —
          // the default (75) visibly softens an already-upscaled image.
          quality={90}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-label={`${name} — profile monogram`}
          role="img"
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
        >
          <span className="select-none text-[28%] font-bold leading-none tracking-tight text-white">
            {initials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
