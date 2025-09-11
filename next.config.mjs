export default { 
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['prisma']
  },
  // Ensure the server binds to 0.0.0.0 for Replit
  server: {
    host: '0.0.0.0'
  }
};
