import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// next-intl middleware handles locale detection and routing
// Exported as default from proxy.ts (Next.js 16 renamed middleware → proxy)
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except admin, api, _next, and static files
  matcher: [
    "/((?!admin|api|_next/static|_next/image|favicon.ico|.*\\..*).+)",
    "/",
  ],
};
