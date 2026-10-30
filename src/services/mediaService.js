import apiClient from './apiClient';

/**
 * Generate a random picsum.photos URL.
 * Using a random seed gives a distinct, stable image across renders.
 */
export function getRandomPicsumUrl(seed = null, width = 1200, height = 800) {
  const actualSeed = seed || `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return `https://picsum.photos/seed/${actualSeed}/${width}/${height}`;
}

/**
 * Shared media upload function.
 * - In local development: returns a random https://picsum.photos image.
 * - In production: uploads to storage and returns the original image URL.
 */
export async function uploadMedia(file, folder = 'general') {
  const isDev = import.meta.env.DEV;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const res = await apiClient.request('/storage/upload', {
      method: 'POST',
      body: formData,
    });

    const data = res?.data || res;

    if (isDev) {
      const picsumUrl = data?.url?.includes('picsum.photos')
        ? data.url
        : getRandomPicsumUrl(null, 1200, 800);
      return {
        ...data,
        url: picsumUrl,
        fileUrl: picsumUrl,
      };
    }

    const finalUrl = data?.url || data?.fileUrl || '';
    return {
      ...data,
      url: finalUrl,
      fileUrl: finalUrl,
    };
  } catch (err) {
    if (isDev) {
      console.warn('Storage upload encountered an issue in dev; using local Picsum fallback:', err);
      const fallbackUrl = getRandomPicsumUrl(null, 1200, 800);
      return {
        key: `local-dev-${Date.now()}`,
        fileName: file.name,
        originalName: file.name,
        url: fallbackUrl,
        fileUrl: fallbackUrl,
      };
    }
    throw err;
  }
}

export default {
  uploadMedia,
  getRandomPicsumUrl,
};

