/**
 * Apply Cloudinary transforms for responsive delivery.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function cloudinaryImageUrl(
  url: string,
  opts: { width?: number; height?: number } = {}
) {
  if (!url.includes("res.cloudinary.com")) return url;

  const [base, rest] = url.split("/upload/");
  if (!rest) return url;

  const transforms = ["f_auto", "q_auto"];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.height) transforms.push(`h_${opts.height}`);
  if (opts.width || opts.height) transforms.push("c_fill");

  return `${base}/upload/${transforms.join(",")}/${rest}`;
}
