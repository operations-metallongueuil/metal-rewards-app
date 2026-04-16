/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.metallongueuil.ca',
      },
    ],
  },
}
module.exports = nextConfig
