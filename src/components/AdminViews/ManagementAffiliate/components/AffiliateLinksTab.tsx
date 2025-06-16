'use client'

// cSpell:words payloadcms
import React, { useState, useEffect } from 'react'
import { Button } from '@payloadcms/ui'
import type { User, AffiliateLink } from '@/payload-types'
import { Link, Plus, Edit, Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  PayloadCard,
  PayloadCardContent,
  PayloadCardDescription,
  PayloadCardHeader,
  PayloadCardTitle,
  PayloadBadge,
  PayloadModal,
  PayloadModalHeader,
  PayloadModalTitle,
  PayloadModalBody,
} from './PayloadUIComponents'
import AffiliateLinkForm from './AffiliateLinkForm'
import qs from 'qs'

interface Props {
  selectedUser: User
  onCountUpdate: (count: number) => void
}

interface PaginationInfo {
  page: number
  limit: number
  totalPages: number
  totalDocs: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const AffiliateLinksTab: React.FC<Props> = ({ selectedUser, onCountUpdate }) => {
  const [expandedLink, setExpandedLink] = useState<number | null>(null)
  const [copiedLink, setCopiedLink] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userLinks, setUserLinks] = useState<AffiliateLink[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalDocs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch affiliate links for the selected user using PayloadCMS REST API
  const fetchAffiliateLinks = async (page: number = 1) => {
    if (!selectedUser) return

    setIsLoadingData(true)
    setError(null)

    try {
      const queryStr = qs.stringify({
        where: {
          affiliateUser: {
            equals: selectedUser.id,
          },
        },

        depth: 2,
        page,
        limit: 10,
        sort: '-createdAt',
      })

      const response = await fetch(`/api/affiliate-links?${queryStr}`)
      const result = await response.json()

      if (response.ok) {
        setUserLinks(result.docs || [])
        setPagination({
          page: result.page || 1,
          limit: result.limit || 10,
          totalPages: result.totalPages || 0,
          totalDocs: result.totalDocs || 0,
          hasNextPage: result.hasNextPage || false,
          hasPrevPage: result.hasPrevPage || false,
        })
        onCountUpdate(result.totalDocs || 0)
      } else {
        setError(result.message || 'Failed to fetch affiliate links')
        setUserLinks([])
        onCountUpdate(0)
      }
    } catch (error) {
      console.error('Error fetching affiliate links:', error)
      setError('Network error. Please try again.')
      setUserLinks([])
      onCountUpdate(0)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch data when user changes or component mounts
  useEffect(() => {
    if (selectedUser) {
      fetchAffiliateLinks(1)
    } else {
      setUserLinks([])
      onCountUpdate(0)
    }
  }, [selectedUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpanded = (linkId: number) => {
    setExpandedLink(expandedLink === linkId ? null : linkId)
  }

  const handleCopyLink = async (link: AffiliateLink) => {
    if (link.targetLink) {
      try {
        await navigator.clipboard.writeText(link.targetLink)
        setCopiedLink(link.id)
        setTimeout(() => setCopiedLink(null), 2000)
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getEventTitle = (link: AffiliateLink) => {
    if (typeof link.event === 'object' && link.event?.title) {
      return link.event.title
    }
    return 'General Link'
  }

  const getLinkStatus = (link: AffiliateLink) => {
    return link.status || 'active'
  }

  const handleCreateLink = async (data: any) => {
    setIsLoading(true)
    try {
      // Format data for the affiliate API
      const formattedData = {
        ...data,
        event: data.event ? parseInt(data.event) : undefined,
        affiliatePromotion: data.affiliatePromotion ? parseInt(data.affiliatePromotion) : undefined,
        affiliateUser: selectedUser.id
      }

      // Validate that event and promotion are integers
      if (formattedData.event && isNaN(formattedData.event)) {
        alert('Invalid event selection')
        return
      }

      const response = await fetch('/api/affiliate-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsCreateModalOpen(false)
        // Refetch data to show the new link
        await fetchAffiliateLinks(pagination.page)
        alert('Created successfully!')
      } else {
        // Handle API validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((detail: any) => `${detail.field}: ${detail.message}`)
            .join('\n')

          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${result.error || 'Failed to create link'}`)
        }
        console.error('Failed to create link:', result)
      }
    } catch (error) {
      console.error('Error creating link:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLink = async (data: any) => {
    if (!editingLink) return

    setIsLoading(true)
    try {
      // Format data for the affiliate API
      const formattedData = {
        ...data,
        event: data.event ? parseInt(data.event) : undefined,
        affiliatePromotion: data.affiliatePromotion ? parseInt(data.affiliatePromotion) : undefined,
      }

      // Validate that event and promotion are integers
      if (formattedData.event && isNaN(formattedData.event)) {
        alert('Invalid event selection')
        return
      }

      const response = await fetch(`/api/affiliate-links/${editingLink.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsEditModalOpen(false)
        setEditingLink(null)
        alert('Updated successfully!')
        // Refetch data to show the updated link
        await fetchAffiliateLinks(pagination.page)
      } else {
        // Handle API validation errors
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details
            .map((detail: any) => `${detail.field}: ${detail.message}`)
            .join('\n')

          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${result.error || 'Failed to update link'}`)
        }
        console.error('Failed to update link:', result)
      }
    } catch (error) {
      console.error('Error updating link:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (link: AffiliateLink) => {
    setEditingLink(link)
    setIsEditModalOpen(true)
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingLink(null)
  }

  const handlePageChange = (newPage: number) => {
    fetchAffiliateLinks(newPage)
  }

  return (
    <div>
      {/* Header */}
      <div className="payload-flex payload-flex--between payload-mb">
        <div>
          <h3
            style={{
              fontSize: 'var(--font-size-h4)',
              fontWeight: 'var(--font-weight-medium)',
              margin: '0 0 calc(var(--base) / 4) 0',
            }}
          >
            Affiliate Links
          </h3>
          <p
            style={{
              fontSize: 'var(--font-size-small)',
              color: 'var(--theme-elevation-600)',
              margin: 0,
            }}
          >
            Manage affiliate links for {selectedUser.email}
          </p>
        </div>
        <Button buttonStyle="primary" size="small" onClick={() => setIsCreateModalOpen(true)}>
          <div className="payload-flex payload-flex--gap">
            <Plus style={{ width: '16px', height: '16px' }} />
            Create New Link
          </div>
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingData && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Link />
              <h3>Loading Links...</h3>
              <p>Please wait while we fetch the affiliate links.</p>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Error State */}
      {error && !isLoadingData && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Link />
              <h3>Error Loading Links</h3>
              <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>
              <Button
                buttonStyle="secondary"
                size="small"
                onClick={() => fetchAffiliateLinks(pagination.page)}
              >
                Try Again
              </Button>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Links List */}
      {!isLoadingData && !error && userLinks.length > 0 && (
        <div>
          {userLinks.map((link) => (
            <PayloadCard key={link.id} className="payload-mb">
              <PayloadCardHeader>
                <div className="payload-flex payload-flex--between">
                  <div className="payload-flex payload-flex--gap">
                    <Link
                      style={{ width: '20px', height: '20px', color: 'var(--theme-elevation-600)' }}
                    />
                    <div>
                      <PayloadCardTitle>{getEventTitle(link)}</PayloadCardTitle>
                      <PayloadCardDescription>
                        Code: {link.affiliateCode} • Created: {formatDate(link.createdAt)}
                      </PayloadCardDescription>
                    </div>
                  </div>
                  <div className="payload-flex payload-flex--gap">
                    <PayloadBadge
                      variant={getLinkStatus(link) === 'active' ? 'success' : 'secondary'}
                    >
                      {getLinkStatus(link)}
                    </PayloadBadge>
                    {link.targetLink && (
                      <Button
                        buttonStyle="secondary"
                        size="small"
                        onClick={() => handleCopyLink(link)}
                      >
                        {copiedLink === link.id ? (
                          <span style={{ color: 'var(--theme-success-600)' }}>Copied!</span>
                        ) : (
                          <Copy style={{ width: '16px', height: '16px' }} />
                        )}
                      </Button>
                    )}
                    <Button
                      buttonStyle="secondary"
                      size="small"
                      onClick={() => toggleExpanded(link.id)}
                    >
                      <Eye style={{ width: '16px', height: '16px' }} />
                    </Button>
                    <Button
                      buttonStyle="secondary"
                      size="small"
                      onClick={() => openEditModal(link)}
                    >
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </PayloadCardHeader>

              {expandedLink === link.id && (
                <PayloadCardContent>
                  <div>
                    <p
                      style={{
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--theme-elevation-600)',
                        margin: 'var(--base) 0',
                      }}
                    >
                      Status: {getLinkStatus(link)} | Event: {getEventTitle(link)}
                    </p>

                    {link.targetLink && (
                      <div
                        style={{
                          padding: 'var(--base)',
                          backgroundColor: 'var(--theme-elevation-50)',
                          borderRadius: 'var(--border-radius-s)',
                          marginBottom: 'var(--base)',
                          fontFamily: 'monospace',
                          fontSize: 'var(--font-size-small)',
                          wordBreak: 'break-all',
                        }}
                      >
                        <strong>Target Link:</strong> {link.targetLink}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 'var(--font-size-small)',
                        color: 'var(--theme-elevation-600)',
                        borderTop: '1px solid var(--theme-elevation-200)',
                        paddingTop: 'calc(var(--base) / 2)',
                        marginTop: 'var(--base)',
                      }}
                    >
                      Created: {new Date(link.createdAt).toLocaleString()} | Updated:{' '}
                      {new Date(link.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </PayloadCardContent>
              )}
            </PayloadCard>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="payload-flex payload-flex--between payload-mt">
              <div
                style={{ fontSize: 'var(--font-size-small)', color: 'var(--theme-elevation-600)' }}
              >
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalDocs)} of{' '}
                {pagination.totalDocs} links
              </div>
              <div className="payload-flex payload-flex--gap">
                <Button
                  buttonStyle="secondary"
                  size="small"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft style={{ width: '16px', height: '16px' }} />
                  Previous
                </Button>
                <span
                  style={{
                    padding: '0 var(--base)',
                    fontSize: 'var(--font-size-small)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  buttonStyle="secondary"
                  size="small"
                  disabled={!pagination.hasNextPage}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                  <ChevronRight style={{ width: '16px', height: '16px' }} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingData && !error && userLinks.length === 0 && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Link />
              <h3>No Links Found</h3>
              <p>
                This affiliate user does not have any links created yet. Create a new link to get
                started.
              </p>
              <Button buttonStyle="primary" size="small" onClick={() => setIsCreateModalOpen(true)}>
                <div className="payload-flex payload-flex--gap">
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Create First Link
                </div>
              </Button>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Create Modal */}
      <PayloadModal isOpen={isCreateModalOpen} onClose={closeModals}>
        <PayloadModalHeader>
          <PayloadModalTitle>Create Affiliate Link</PayloadModalTitle>
        </PayloadModalHeader>
        <PayloadModalBody>
          <AffiliateLinkForm
            selectedUser={selectedUser}
            onSubmit={handleCreateLink}
            onCancel={closeModals}
            isLoading={isLoading}
          />
        </PayloadModalBody>
      </PayloadModal>

      {/* Edit Modal */}
      <PayloadModal isOpen={isEditModalOpen} onClose={closeModals}>
        <PayloadModalHeader>
          <PayloadModalTitle>Edit Affiliate Link</PayloadModalTitle>
        </PayloadModalHeader>
        <PayloadModalBody>
          {editingLink && (
            <AffiliateLinkForm
              selectedUser={selectedUser}
              link={editingLink}
              onSubmit={handleEditLink}
              onCancel={closeModals}
              isLoading={isLoading}
            />
          )}
        </PayloadModalBody>
      </PayloadModal>
    </div>
  )
}

export default AffiliateLinksTab
