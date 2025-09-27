/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 배포 최적화
  compress: true,
  poweredByHeader: false,
  // ESLint 빌드 시 무시 (빌드 속도 향상)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript 빌드 에러 무시 (필요시)
  typescript: {
    // ignoreBuildErrors: true, // 주석 처리 - 타입 에러는 수정하는 것이 좋음
  },
  // 환경변수
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['recharts'],
  },
};

export default nextConfig;
