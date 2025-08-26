import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de otimização
  experimental: {
    optimizePackageImports: ['@google/generative-ai', 'framer-motion', 'lucide-react'],
  },
  
  // Configurações de imagens
  images: {
    domains: ['placehold.co'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configurações de segurança
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações de compressão
  compress: true,
  
  // Configurações de PWA (opcional)
  // pwa: {
  //   dest: 'public',
  //   register: true,
  //   skipWaiting: true,
  // },
};

export default nextConfig;
