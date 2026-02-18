'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function ImageUploader({
  state,
  imageUrl,
  onRemove,
}: {
  state: any;
  imageUrl?: string | null;
  onRemove: () => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(imageUrl || null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the file to use as a preview source
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageSrc(null);
    }
  };

  const removeImage = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setImageSrc(null);
    if (imageUrl) { onRemove(); }
  };

  return (
    <>
      <label className="mb-2 block text-sm font-medium">
        Upload Image <span className="text-red-500">*</span>
      </label>
      <div className="relative mt-2 rounded-md">
        <div className="relative">
          <input type="hidden" name="oldImageUrl" value={imageUrl || ''} />
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            aria-describedby="imageFile-error"
          />
          <label htmlFor="imageFile" className="cursor-pointer">
            {imageSrc ? (
              <div className="relative w-32 h-32">
                <Image
                  src={imageSrc}
                  alt="Image preview"
                  fill
                  sizes="28px"
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={removeImage}>
                  <TrashIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-full h-32 bg-white rounded-md border border-gray-200 text-sm outline-2 flex flex-col items-center justify-center p-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
              </div>
            )}
          </label>
        </div>
      </div>
      <div id="imageFile-error" aria-live="polite" aria-atomic="true">
        {state.errors?.imageFile &&
          state.errors.imageFile.map((error: string) => (
            <p className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
    </>
    // <div>
    //   <input type="file" accept="image/*" onChange={handleImageChange} />
    //   {imageSrc && (
    //     <div>
    //       {/* Use the standard <img> tag for object URLs or data URLs in development. */}
    //       {/* For the Next.js Image component, you would need to use the unoptimized prop for Data URLs */}
    //       <img src={imageSrc} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
    //     </div>
    //   )}
    // </div>
  );
};
