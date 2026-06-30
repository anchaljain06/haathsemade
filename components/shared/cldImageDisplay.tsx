import { CldImage } from "next-cloudinary";

interface CldImageDisplayProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function CldImageDisplay({
  src,
  alt,
  width,
  height,
  className,
}: CldImageDisplayProps) {
  return (
    <CldImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      quality="auto"
      format="auto"
    />
  );
}