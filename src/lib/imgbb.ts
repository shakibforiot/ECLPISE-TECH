const IMGBB_API_KEY = '3f9023796fdccc904f6484368c605128';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';
const MAX_IMAGE_SIZE = 32 * 1024 * 1024;

export interface ImageBBUpload {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

interface ImageBBResponse {
  success: boolean;
  data?: {
    url?: string;
    display_url?: string;
    width?: string;
    height?: string;
    thumb?: { url?: string };
  };
  error?: { message?: string };
}

function safeUploadName(name: string) {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'eclipse-upload';
}

/** Upload a local file to ImageBB API v1 using its multipart POST endpoint. */
export async function uploadImageToImageBB(file: File, preferredName?: string): Promise<ImageBBUpload> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Image must be 32 MB or smaller');

  const form = new FormData();
  form.append('image', file);
  form.append('name', safeUploadName(preferredName || file.name));

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(IMGBB_API_KEY)}`, {
    method: 'POST',
    body: form,
  });
  const result = (await response.json()) as ImageBBResponse;
  if (!response.ok || !result.success || !result.data?.url) {
    throw new Error(result.error?.message || 'Image upload failed');
  }

  return {
    url: result.data.display_url || result.data.url,
    thumbnailUrl: result.data.thumb?.url || result.data.display_url || result.data.url,
    width: Number(result.data.width) || 0,
    height: Number(result.data.height) || 0,
  };
}