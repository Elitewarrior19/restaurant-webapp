import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // Fix Firebase postinstall.mjs resolution (nested @firebase/util only has .js)
    config.resolve.alias = {
      ...config.resolve.alias,
      "@firebase/util": path.resolve(__dirname, "node_modules/@firebase/util"),
    };
    return config;
  },
};

export default nextConfig;

