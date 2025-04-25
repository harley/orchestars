const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const checkinRedirect = {
    source: '/customer-checkin-ticket',
    destination: '/self',
    permanent: false,
  }

  const redirects = [internetExplorerRedirect, checkinRedirect]

  return redirects
}

export default redirects
