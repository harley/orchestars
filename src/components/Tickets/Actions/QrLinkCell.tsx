import React from 'react'

// Cell component for displaying ticket URL links in admin table
const QrLinkCell = ({ rowData }: { rowData: { ticketCode?: string } }) => {
  if (!rowData?.ticketCode) return null
  
  const url = `/ticket/${rowData.ticketCode}`
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ color: '#3B82F6', textDecoration: 'underline' }}
    >
      View Ticket
    </a>
  )
}

export default QrLinkCell 