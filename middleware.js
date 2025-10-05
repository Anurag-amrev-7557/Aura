export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/ats/:path*",
    "/jobs/:path*",
    "/pricing/:path*",
  ],
};


