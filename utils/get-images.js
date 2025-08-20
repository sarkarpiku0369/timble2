import { PURPLE_IMAGES } from "../constants/purple-images";

export function getImages(length) {
  const imageList = PURPLE_IMAGES;

  if (length < 1) {
    return [];
  }

  if (length > imageList.length) {
    return [
      ...Array.from({ length: Math.floor(length / imageList.length) }, () => imageList).flat(),
      ...imageList.slice(0, length % imageList.length),
    ];
  }

  return imageList.slice(0, length);
}