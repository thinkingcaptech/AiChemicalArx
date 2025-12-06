import { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react';
import type { MessageImage } from '../types';

interface ImageViewerProps {
  images: MessageImage[];
  className?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ images, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
    setZoom(1);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setZoom(1);
  };

  const downloadImage = (image: MessageImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.alt || 'image';
    link.click();
  };

  if (!images || images.length === 0) return null;

  return (
    <div className={className}>
      {/* Image Grid */}
      <div className={`grid gap-2 ${
        images.length === 1 
          ? 'grid-cols-1' 
          : images.length === 2 
          ? 'grid-cols-2' 
          : 'grid-cols-2 sm:grid-cols-3'
      }`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer rounded-lg overflow-hidden border border-[var(--color-mystic)] bg-[var(--color-obsidian)]"
            onClick={() => handleImageClick(index)}
          >
            <img
              src={image.url}
              alt={image.alt || `Image ${index + 1}`}
              className="w-full h-auto max-h-48 object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            {/* Image count badge for multiple images */}
            {images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {index + 1}/{images.length}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative max-w-[95vw] max-h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {selectedImage + 1} of {images.length}
                </span>
                {images[selectedImage].alt && (
                  <span className="text-sm text-gray-300">
                    • {images[selectedImage].alt}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                
                <span className="text-sm min-w-[4rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                
                {/* Download */}
                <button
                  onClick={() => downloadImage(images[selectedImage])}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Download image"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                {/* Close */}
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Image */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
              <img
                src={images[selectedImage].url}
                alt={images[selectedImage].alt || `Image ${selectedImage + 1}`}
                className="max-w-full max-h-full object-contain transition-transform"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            
            {/* Navigation for multiple images */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-4 p-4">
                <button
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  disabled={selectedImage === 0}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
                  disabled={selectedImage === images.length - 1}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={closeModal}
          />
        </div>
      )}
    </div>
  );
};