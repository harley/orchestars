import React from 'react'
import Script from 'next/script'

interface GTMProps {
  gtmKey?: string
}

/**
 * Google Tag Manager component
 * Usage: <GTM gtmKey="GTM-XXXXXXX" />
 */
export const GTM: React.FC<GTMProps> = ({ gtmKey }) => {
  if (!gtmKey) return null
  return (
    <>
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmKey}');
        `}
      </Script>
    </>
  )
}

export const GTM_NO_SCRIPT = ({ gtmKey }: { gtmKey?: string }) => {
  // /* Body noscript fallback (to be placed at the top of <body>) */
  return gtmKey ? (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmKey}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      ></iframe>
    </noscript>
  ) : null
}
