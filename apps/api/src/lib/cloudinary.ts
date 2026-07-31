import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isCloudinaryConfigured() {
  return Boolean(cloudName && apiKey && apiSecret);
}

export function createUploadSignature(
  merchantId: string,
  purpose: "products" | "branding" = "products"
) {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder =
    purpose === "branding"
      ? `simba/${merchantId}/branding`
      : `simba/${merchantId}/products`;
  const params = { timestamp, folder };

  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
  };
}

export function isCloudinaryUrl(url: string) {
  return url.includes("res.cloudinary.com");
}
