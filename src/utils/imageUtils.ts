import type { MessageImage } from '../types';

export function extractImages(content: string): MessageImage[] {
  const images: MessageImage[] = [];
  
  // Markdown image pattern: ![alt](url)
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = markdownImageRegex.exec(content)) !== null) {
    images.push({
      url: match[2].trim(),
      alt: match[1] || undefined,
    });
  }
  
  // Direct URL patterns (common image extensions)
  const urlImageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|bmp|webp|svg)(?:\?[^\s]*)?)/gi;
  
  let urlMatch;
  while ((urlMatch = urlImageRegex.exec(content)) !== null) {
    const url = urlMatch[1];
    // Check if this URL is already captured by markdown
    if (!images.some(img => img.url === url)) {
      images.push({
        url,
        alt: 'Image',
      });
    }
  }
  
  return images;
}

export function removeImagesFromContent(content: string): string {
  // Remove markdown images
  let cleaned = content.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  
  // Remove standalone image URLs (but be careful not to remove URLs in text)
  cleaned = cleaned.replace(/(^|\s)(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|bmp|webp|svg)(?:\?[^\s]*)?)(\s|$)/gi, '$1$3');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
  
  return cleaned;
}

export function isImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(pathname);
  } catch {
    return false;
  }
}

export function createImageFromUrl(url: string, alt?: string): MessageImage {
  return {
    url,
    alt: alt || 'Image',
  };
}