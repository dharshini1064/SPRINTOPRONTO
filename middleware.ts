import { withAuth } from "next-auth/middleware"

export default withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  }
})

export const config = {
  // Guard dashboard, chat command center, and incident workspaces
  // Explicitly excludes /api/* so health-check and auth endpoints are not blocked
  matcher: [
    "/",
    "/chat",
    "/incidents",
    "/settings",
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
}
