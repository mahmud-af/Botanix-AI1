import React, { useState, useRef } from 'react';
import { Icons } from './Icons';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Target dimensions: fast processing but high enough detail
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG at 0.7 quality - drastically reduces size with minimal visual loss for AI
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        onImageSelected(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  return (
    <div className="w-full h-full">
      <div
        className={`group relative w-full overflow-hidden rounded-[2.5rem] transition-all duration-700 ease-out
          ${isDragging 
            ? 'ring-8 ring-botanical-500/20 bg-botanical-50 scale-[1.02]' 
            : 'bg-white shadow-2xl shadow-stone-200/50 border border-stone-100'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-botanical-50/50 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col items-center justify-center py-16 px-6 text-center">
          
          <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6 tracking-tight">
            Start your analysis
          </h3>
          
          <div className="flex flex-col w-full max-w-sm gap-4">
            
            {/* Primary Camera Action */}
            <button
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              className="relative w-full group/btn overflow-hidden rounded-2xl bg-stone-900 text-white p-1 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-botanical-900 to-stone-900 transition-colors"></div>
              <div className="relative h-16 flex items-center justify-center gap-4 border border-white/10 rounded-xl bg-clip-padding backdrop-filter backdrop-blur-sm">
                <div className="w-10 h-10 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-md group-hover/btn:scale-110 transition-transform duration-300">
                   <Icons.Camera size={20} />
                </div>
                <span className="text-lg font-medium tracking-wide">Snap Photo</span>
              </div>
            </button>

            {/* Secondary Upload Action */}
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="w-full h-16 flex items-center justify-center gap-3 rounded-2xl border-2 border-stone-100 text-stone-500 font-medium hover:bg-stone-50 hover:border-stone-200 hover:text-stone-800 transition-all duration-300 active:scale-95"
            >
              <Icons.Upload size={20} />
              <span>Upload from Gallery</span>
            </button>
          </div>

          <p className="mt-8 text-stone-400 text-sm font-medium tracking-wide uppercase">
             Fast AI Processing • JPG, PNG, WEBP
          </p>
        </div>
        
        {/* Standard File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Camera-Specific Input - Native behavior */}
        <input
          type="file"
          ref={cameraInputRef}
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};