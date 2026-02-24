/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "newsapp-server-u11s.onrender.com",
    ],
  },
};

export default nextConfig;
