/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "s.gravatar.com",
      "cdn.auth0.com",
      "localhost",
    ],
    path: "/_next/image",
  },
  // Adicione esta parte para servir arquivos estáticos da pasta uploads
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
