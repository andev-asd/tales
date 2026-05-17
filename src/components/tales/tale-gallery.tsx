'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

type TaleGalleryProps = {
  title: string;
  imageUrls: string[];
};

export function TaleGallery({ title, imageUrls }: TaleGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  const handleSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    handleSelect();
    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', handleSelect);
    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', handleSelect);
    };
  }, [emblaApi, handleSelect]);

  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-app-elevated" ref={emblaRef}>
        <div className="flex">
          {imageUrls.map((url, index) => (
            <div key={url} className="min-w-0 shrink-0 grow-0 basis-full">
              <div className="flex h-[520px] items-center justify-center p-4">
                <img src={url} alt={`${title} ${index + 1}`} className="max-h-full w-full object-contain" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {imageUrls.length > 1 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {imageUrls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`shrink-0 overflow-hidden rounded-[var(--radius-md)] border ${selectedIndex === index ? 'border-app-accent' : 'border-app-border'}`}
            >
              <div className="flex h-28 w-28 items-center justify-center bg-app-elevated p-2">
                <img src={url} alt={`${title} мініатюра ${index + 1}`} className="max-h-full w-full object-contain" />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
