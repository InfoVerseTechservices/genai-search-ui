const nextConfig = {
  // Use assetPrefix if it's a production environment
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_SITE_URL_PROD : undefined,

  // Enforce trailing slashes in URLs
  trailingSlash: true,
}

module.exports = nextConfig;
