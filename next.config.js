// We'll use a specific environment variable to signal a true production deployment.
// This allows `next build` to be run locally for testing without applying the assetPrefix.
const isProdDeployment = process.env.PROD_DEPLOYMENT === 'true';

const nextConfig = {
  // Use assetPrefix only for true production deployments, not for local production builds
  assetPrefix:
    isProdDeployment ? process.env.NEXT_PUBLIC_SITE_URL_PROD : undefined,

  // Enforce trailing slashes in URLs
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
