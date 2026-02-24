/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "aboki-newsapp-8c7372ca5580.herokuapp.com",
      "newsapp-najw.onrender.com",
    ],
  },
};

export default nextConfig;
