import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface ProtectedImageProps {
  src: string;
  alt?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProtectedImage: React.FC<ProtectedImageProps> = ({ src, alt, className, onLoad, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fetchAndDrawImage = () => {
      setLoading(true);
      setError(false);
      
      const img = new Image();
      img.crossOrigin = "anonymous"; // Try with CORS first
      
      img.onload = () => {
        if (!isMounted) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setLoading(false);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        // If anonymous fails, try without CORS (will taint canvas)
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          if (!isMounted) return;
          canvas.width = fallbackImg.width;
          canvas.height = fallbackImg.height;
          ctx.drawImage(fallbackImg, 0, 0);
          setLoading(false);
          if (onLoad) onLoad();
        };
        fallbackImg.onerror = () => {
          if (isMounted) {
            setError(true);
            setLoading(false);
            if (onError) onError();
          }
        };
        fallbackImg.src = src;
      };
      
      img.src = src;
    };

    fetchAndDrawImage();

    return () => {
      isMounted = false;
      // Clear canvas on unmount
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [src, onLoad, onError]);

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 animate-pulse z-10">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 text-zinc-500 text-sm z-10">
          Failed to load image
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className={cn(
          "transition-opacity duration-300",
          loading ? "opacity-0" : "opacity-100",
          className
        )}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          pointerEvents: 'none', // Prevent interacting with the canvas directly
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        aria-label={alt}
        role="img"
      />
      
      {/* Invisible overlay to capture clicks if pointerEvents: none is used on canvas, 
          but we want the parent to handle clicks, so this is fine. */}
      <div 
        className="absolute inset-0 z-20" 
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  );
};
