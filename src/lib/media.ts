import { buildCloudinaryUrl } from "@/lib/cloudinary";

const HERO_IMAGE_ID = process.env.NEXT_PUBLIC_HERO_IMAGE_ID ?? "";

export function getHeroImageUrl() {
  if (!HERO_IMAGE_ID) return null;
  return buildCloudinaryUrl(HERO_IMAGE_ID, {
    width: 1600,
    quality: 80
  });
}

