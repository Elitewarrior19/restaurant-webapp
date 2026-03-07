const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "da3dmwxj9";

export function getCloudinaryCloudName() {
  return CLOUDINARY_CLOUD_NAME;
}

export function getCloudinaryUploadUrl() {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}

export function buildCloudinaryUrl(publicId: string, options?: { width?: number; height?: number; quality?: number }) {
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  const transformSegment = transforms.length ? `/${transforms.join(",")}` : "";
  return `${base}${transformSegment}/${publicId}`;
}

