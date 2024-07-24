import runtimeCaching from "next-pwa/cache.js";
import withPWA from "next-pwa";

const pwaConfig = {
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
};

const nextConfig = {
  // other configs
  reactStrictMode: false,
  output: "export",
};

export default withPWA(pwaConfig)(nextConfig);
