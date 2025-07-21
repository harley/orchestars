export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// Track a pageview (called on route change)
export const pageview = (url: string) => {
  if (!GA_ID) return
  ;(window as any).gtag('config', GA_ID, {
    page_path: url,
  })
}
