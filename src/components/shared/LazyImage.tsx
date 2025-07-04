import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function LazyImage({
  src,
  alt,
  className,
  placeholderSrc = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect width="400" height="600" fill="%23e5e5e5"/%3E%3C/svg%3E',
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '50px',
    triggerOnce: true,
  });

  useEffect(() => {
    if (!inView || !src || loaded) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setError(true);
      onError?.();
    };
    
    img.src = src;
  }, [inView, src, loaded, onLoad, onError]);

  const handleImageRef = (node: HTMLImageElement | null) => {
    setImageRef(node);
    ref(node);
  };

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      <img
        ref={handleImageRef}
        src={imageSrc}
        alt={alt}
        className={clsx(
          'w-full h-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          error && 'opacity-50'
        )}
        loading="lazy"
      />
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}