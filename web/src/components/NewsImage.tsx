"use client";

import { useState } from "react";

interface NewsImageProps {
  src: string;
  alt: string;
  className?: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800&q=80";

export default function NewsImage({ src, alt, className = "" }: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {hasError && !imgSrc.includes("unsplash") ? (
        <div className={`bg-[#162847] flex items-center justify-center ${className}`}>
          <span className="text-4xl">🌐</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          loading="lazy"
          onError={() => {
            if (!hasError) {
              setHasError(true);
              setImgSrc(FALLBACK);
            }
          }}
        />
      )}
    </>
  );
}
