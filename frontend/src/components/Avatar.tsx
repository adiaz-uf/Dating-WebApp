import { cn } from "../lib/utils";

interface AvatarProps {
  src: string;
  alt?: string;
  className?: string;
}

export default function Avatar({ src, alt = "Avatar", className = "" }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full h-full bg-pink-300 rounded-full border", className)}
    />
  );
}