import React from 'react'

interface WrongEventErrorProps {
  error: {
    message: string
    ticketCode: string
  }
}

export const WrongEventError: React.FC<WrongEventErrorProps> = ({ error }) => {
  return (
    <div className="text-center mb-6 p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
      <p className="text-orange-400 text-sm font-medium mb-2">Wrong Event/Date</p>
      <div className="text-white text-sm mb-2">
        <span className="text-gray-300 font-mono text-xs">
          {error.ticketCode}
        </span>
      </div>
      <p className="text-orange-200 text-xs leading-relaxed">
        {error.message}
      </p>
    </div>
  )
}
