const imageDomains = process.env.ALLOWED_IMAGE_DOMAINS
  ? process.env.ALLOWED_IMAGE_DOMAINS.split(',')
  : [];

const devOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',')
  : [];

module.exports = {
  allowedDevOrigins: devOrigins,
  images: {
    remotePatterns: imageDomains.map(domain => ({
      protocol: 'https',
      hostname: domain,
    })),
  },
}