// import { GA_ID } from '@/lib/gtag'
import { GoogleAnalytics } from '@next/third-parties/google'
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body>
        {children}
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  )
}
