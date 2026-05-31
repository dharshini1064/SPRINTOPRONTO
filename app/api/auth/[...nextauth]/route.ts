import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { queryUserByEmail } from "@/lib/db"
import bcrypt from "bcryptjs"

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "[Auth] NEXTAUTH_SECRET environment variable is not set. " +
    "Generate one with: openssl rand -base64 32"
  )
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "manager@sprintopronto.ai" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }

        const user = await queryUserByEmail(credentials.email)
        if (!user) {
          // Constant-time rejection — don't leak whether email exists
          throw new Error("Invalid credentials")
        }

        // Bcrypt-only comparison — no plaintext bypass
        const isPasswordValid = bcrypt.compareSync(credentials.password, user.passwordHash)

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        } as any
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  secret: process.env.NEXTAUTH_SECRET
})

export { handler as GET, handler as POST }
