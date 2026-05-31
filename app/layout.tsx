import type { Metadata } from "next"
import "./globals.css"
import Sidebar from "./components/Sidebar"
import Providers from "./components/Providers"

export const metadata: Metadata = {
  title: "Sprintopronto AI — Operational Intelligence for Engineering Teams",
  description: "AI-powered dashboard and command center correlating Linear sprint data, GitHub PRs, and Slack conversations to detect blockers and sprint risks.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-slate-100 bg-[#090a0f] selection:bg-accent-indigo/35 selection:text-white">
        <Providers>
          <div className="flex">
            {/* Permanent Sidebar Navigation */}
            <Sidebar />

            {/* Main App Content View Area */}
            <main className="flex-1 min-h-screen pl-64 relative z-10">
              {/* Top decorative glow */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[350px] bg-gradient-to-b from-accent-indigo/10 via-transparent to-transparent blur-3xl pointer-events-none rounded-full"></div>
              
              {/* Page content */}
              <div className="p-8 max-w-7xl mx-auto relative z-20">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
