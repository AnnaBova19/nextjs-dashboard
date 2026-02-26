import { NextResponse } from "next/server";

export const GET = () => {
  const env = process.env.NODE_ENV; // "development" | "production"
  const host = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const robotsTxt = env === "production"
    ? `User-agent: *
Disallow:

Sitemap: ${host}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};