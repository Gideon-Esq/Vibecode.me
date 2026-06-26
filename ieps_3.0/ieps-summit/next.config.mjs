/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // PDFKit reads font/data files from disk and Nodemailer uses dynamic
    // requires; keep both out of the webpack bundle so they resolve at runtime.
    serverComponentsExternalPackages: ["pdfkit", "nodemailer"],
    // Ensure the organiser logos are available to the certificate routes in
    // serverless deploys (they're embedded into the PDF).
    outputFileTracingIncludes: {
      "/api/admin/generate-certificate": ["./public/logos/**/*"],
      "/api/admin/generate-all-certificates": ["./public/logos/**/*"],
      "/api/certificate/[id]": ["./public/logos/**/*"],
    },
  },
};

export default nextConfig;
