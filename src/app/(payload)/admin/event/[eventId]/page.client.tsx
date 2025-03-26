'use client'

import React from 'react'
import Link from 'next/link'

const AdminEventClient: React.FC = () => {
  // Since we're in the admin route group, authentication is handled by Payload
  // If user is not authenticated, they will be redirected to login automatically
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>Event Details</h1>
      <div>
        <p>This is a custom admin view for events.</p>
        <p>Authentication is handled automatically by Payload in admin routes.</p>
      </div>
    </div>
  )
}

export default AdminEventClient
