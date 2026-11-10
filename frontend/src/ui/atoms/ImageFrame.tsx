interface ImageFrameProps {
  src: string | null;
  alt: string;
  /** large = 400x300 detail frame, thumb = 4:3 thumbnail. */
  size?: 'large' | 'thumb';
}

/** Fixed 4:3 frame. The image is fitted inside with margins (never cropped). */
export function ImageFrame({ src, alt, size = 'large' }: ImageFrameProps) {
  return (
    <div className={`image-frame image-frame--${size}`}>
      {src ? <img src={src} alt={alt} /> : <span>No image available</span>}
    </div>
  );
}
