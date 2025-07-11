'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="mt-6 w-full max-w-md">
            <div className="bg-red-600/20 border border-red-600/50 rounded p-4 text-center">
              <p className="text-red-400 font-medium">Something went wrong</p>
              <p className="text-red-300 text-sm mt-1">Please refresh the page</p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 