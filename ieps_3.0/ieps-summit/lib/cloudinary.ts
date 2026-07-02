import { v2 as cloudinary } from "cloudinary";

let configured: boolean | null = null;

/** Configure the SDK once from env. Supports CLOUDINARY_URL or the trio. */
function ensureConfigured(): boolean {
  if (configured !== null) return configured;

  if (process.env.CLOUDINARY_URL) {
    // The SDK auto-reads CLOUDINARY_URL; just mark secure delivery.
    cloudinary.config({ secure: true });
    configured = true;
    return true;
  }

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
    configured = true;
    return true;
  }

  configured = false;
  return false;
}

export function isCloudinaryConfigured(): boolean {
  return ensureConfigured();
}

/**
 * Uploads a certificate PDF buffer to Cloudinary and returns its secure URL.
 * `filename` should include the `.pdf` extension (e.g. IEPS-3.0-Certificate-x.pdf).
 * Throws if Cloudinary is not configured.
 */
export function uploadCertificate(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (!ensureConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET."
    );
  }

  // Strip extension for the public_id; keep it for the delivered file name.
  const publicId = filename.replace(/\.pdf$/i, "");

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "ieps-certificates",
        public_id: `${publicId}.pdf`,
        overwrite: true,
        use_filename: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error("Cloudinary upload returned no URL"));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
