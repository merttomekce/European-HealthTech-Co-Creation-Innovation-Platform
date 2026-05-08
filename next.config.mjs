/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow images from Supabase storage if needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
