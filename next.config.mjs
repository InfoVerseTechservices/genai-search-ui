/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['colomboai.com'],
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
