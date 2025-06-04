"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";

declare global {
  var cloudinary: any;
}

interface ImageUploadProps {
  onChange: (value: string[]) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
  const handleUpload = useCallback(
    (result: any) => {
      if (value.length >= 10) {
        return;
      }
      onChange([...value, result.info.secure_url]);
    },
    [onChange, value]
  );

  const handleRemove = useCallback(
    (url: string) => {
      onChange(value.filter((image) => image !== url));
    },
    [onChange, value]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              fill
              style={{ objectFit: "cover" }}
              src={url}
              alt={`Upload ${index + 1}`}
              className="rounded-lg"
            />
            <button
              onClick={() => handleRemove(url)}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <IoMdClose size={20} />
            </button>
          </div>
        ))}
        {value.length < 10 && (
          <CldUploadWidget
            onUpload={handleUpload}
            uploadPreset="chat-app"
            options={{
              maxFiles: 1,
            }}
          >
            {({ open }) => {
              return (
                <div
                  onClick={() => open?.()}
                  className="
                    relative cursor-pointer hover:opacity-70 transition
                    border-dashed border-2 p-4 border-neutral-300
                    flex flex-col justify-center items-center gap-4
                    text-neutral-600 aspect-square rounded-lg
                  "
                >
                  <TbPhotoPlus size={30} />
                  <div className="font-semibold text-sm">Click to upload</div>
                </div>
              );
            }}
          </CldUploadWidget>
        )}
      </div>
      <div className="text-sm text-neutral-500">
        {value.length}/10 images uploaded
      </div>
    </div>
  );
};

export default ImageUpload;
