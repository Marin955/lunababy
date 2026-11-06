import React from 'react';
import Image from 'next/image';

interface PhotoCollageProps {
  /** Up to four photo paths; laid out as a 2x2 grid. */
  srcs: readonly string[];
  /** Describes the collage as a whole (e.g. the bundle name). Tiles are decorative. */
  alt: string;
  /** `sizes` for the whole collage; each tile requests half of it. */
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

// Halve every width in a `sizes` string so each tile asks for the right source.
function halveSizes(sizes: string): string {
  return sizes.replace(/(\d+(?:\.\d+)?)(vw|px)/g, (_, n: string, unit: string) => `${Number(n) / 2}${unit}`);
}

export default function PhotoCollage({
  srcs,
  alt,
  sizes,
  className = '',
  imageClassName = '',
  priority = false,
}: PhotoCollageProps) {
  const tiles = srcs.slice(0, 4);
  const tileSizes = halveSizes(sizes);

  return (
    <div role="img" aria-label={alt} className={`grid grid-cols-2 grid-rows-2 gap-1 bg-white ${className}`}>
      {tiles.map((src) => (
        <div key={src} className="relative overflow-hidden bg-cream">
          <Image
            src={src}
            alt=""
            fill
            sizes={tileSizes}
            priority={priority}
            className={`object-cover ${imageClassName}`}
          />
        </div>
      ))}
    </div>
  );
}
