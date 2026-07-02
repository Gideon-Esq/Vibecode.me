/** Security headers applied to every response. */
const securityHeaders = [
  // Force HTTPS for a year (incl. subdomains) once seen over HTTPS.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Never MIME-sniff responses.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the origin as referrer to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This site never needs these browser features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    // PDFKit reads font/data files from disk and Nodemailer uses dynamic
    // requires; keep both out of the webpack bundle so they resolve at runtime.
    serverComponentsExternalPackages: ["pdfkit", "nodemailer"],
    // Ensure the organiser logos are available to the certificate routes
    // (embedded into the PDF) and to every email-sending route (the IEPS
    // logo is attached inline to outgoing mail) in serverless deploys.
    outputFileTracingIncludes: {
      "/api/admin/generate-certificate": ["./public/logos/**/*", "./public/signatures/**/*"],
      "/api/admin/generate-all-certificates": ["./public/logos/**/*", "./public/signatures/**/*"],
      "/api/certificate/[id]": ["./public/logos/**/*", "./public/signatures/**/*"],
      "/api/register": ["./public/logos/**/*"],
      "/api/contact": ["./public/logos/**/*"],
      "/api/admin/send-bulk-email": ["./public/logos/**/*"],
    },
  },
};

export default nextConfig;
