import { apiClient } from "./client";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

export type UploadPurpose = "products" | "branding";

export const uploadsApi = {
  sign: (purpose: UploadPurpose = "products") =>
    apiClient.post<UploadSignature>("/store/uploads/sign", { purpose }),

  upload: async (
    file: File,
    purpose: UploadPurpose = "products"
  ): Promise<string> => {
    const sign = await uploadsApi.sign(purpose);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.apiKey);
    formData.append("timestamp", String(sign.timestamp));
    formData.append("signature", sign.signature);
    formData.append("folder", sign.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as { error?: { message?: string } }).error?.message ??
          "Image upload failed"
      );
    }

    const data = (await res.json()) as CloudinaryUploadResult;
    return data.secure_url;
  },
};
