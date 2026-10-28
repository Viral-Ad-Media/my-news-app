/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEWS_TEST_INSTANCE === "1" ? ".next-test" : ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "newsapp-server-u11s.onrender.com" },
      { protocol: "https", hostname: "img.allsides.com" },
    ],
  },
};

export default nextConfig;
