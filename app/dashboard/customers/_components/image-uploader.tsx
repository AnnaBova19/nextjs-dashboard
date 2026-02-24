'use client';

import { ChangeEvent, useState } from 'react';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';

export default function ImageUploader({
  label,
  required,
  imageUrl,
  onRemove,
  onChange,
  value,
  error,
}: {
  label: string;
  required?: boolean;
  imageUrl?: string | null;
  onRemove: () => void;
  onChange: (file: File | null) => void;
  value: any;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a URL for the file to use as a preview source
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    } else {
      setPreview(null);
    }
  };

  const handleRemove = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPreview(null);
    onChange(null);
    if (imageUrl) { onRemove(); }
  };

  return (
    <Field data-invalid={!!error}>
      <FieldLabel required={required} htmlFor="file-input-image">
        {label}
      </FieldLabel>

      <div className="relative mt-2 rounded-md">
        <div className="relative">
          <input type="hidden" name="oldImageUrl" value={imageUrl || ''} />
          <Input
            id="file-input-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="file-input-image" className="cursor-pointer">
            {preview ? (
              <div className="relative w-32 h-32">
                <Image
                  src={preview}
                  alt="Image preview"
                  fill
                  sizes="28px"
                  className="rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={handleRemove}>
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
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
};
