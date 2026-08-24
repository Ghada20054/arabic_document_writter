/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@prisma/client',
    '.prisma/client',
  ],

  allowedDevOrigins: ['192.168.238.1'],
};

module.exports = nextConfig;