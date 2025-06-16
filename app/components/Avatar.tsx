"use client";

import Image from "next/image";

interface AvatarProps {
  src: string | null | undefined;
  size?: "small" | "medium" | "large";
}

const Avatar: React.FC<AvatarProps> = ({ src, size = "medium" }) => {
  const sizeClasses = {
    small: { width: 24, height: 24 },
    medium: { width: 30, height: 30 },
    large: { width: 40, height: 40 },
  };

  const currentSize = sizeClasses[size];

  return (
    <Image
      className="rounded-full"
      height={currentSize.height}
      width={currentSize.width}
      alt="Avatar"
      src={src || "/images/placeholder.jpg"}
    />
  );
};

export default Avatar;
