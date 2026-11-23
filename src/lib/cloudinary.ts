import { v2 as cloudinary } from "cloudinary";

// Konfigurasi Cloudinary untuk upload galeri & bukti transfer, plus transformasi
// gambar responsif. Lihat docs/02 & docs/07.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/** Tanda tangan untuk signed upload dari klien dashboard. */
export function signUploadParams(params: Record<string, string | number>): {
  signature: string;
  timestamp: number;
} {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { ...params, timestamp },
    process.env.CLOUDINARY_API_SECRET ?? "",
  );
  return { signature, timestamp };
}
