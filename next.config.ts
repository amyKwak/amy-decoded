import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Nat 20 was renamed The Lucky Goose. Old links and invite codes
      // (?join=…) carry over: the query string is passed along.
      {
        source: "/projects/nat20",
        destination: "/projects/lucky-goose",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
