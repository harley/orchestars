'use client'

// cSpell:words payloadcms
import React, { useState, useEffect } from 'react'
import { Button, toast } from '@payloadcms/ui'
import type { User, AffiliateSetting } from '@/payload-types'
import { Settings, Plus, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
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
import AffiliateSettingsForm from './AffiliateSettingsForm'
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

const AffiliateSettingsTab: React.FC<Props> = ({ selectedUser, onCountUpdate }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<AffiliateSetting | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userSettings, setUserSettings] = useState<AffiliateSetting[]>([])
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

  // Fetch affiliate settings for the selected user using PayloadCMS REST API
  const fetchAffiliateSettings = async (page: number = 1) => {
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

      const response = await fetch(`/api/affiliate-settings?${queryStr}`)
      const result = await response.json()

      if (response.ok) {
        setUserSettings(result.docs || [])
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
        setError(result.message || 'Failed to fetch affiliate settings')
        setUserSettings([])
        onCountUpdate(0)
      }
    } catch (error) {
      console.error('Error fetching affiliate settings:', error)
      setError('Network error. Please try again.')
      setUserSettings([])
      onCountUpdate(0)
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch data when user changes or component mounts
  useEffect(() => {
    if (selectedUser) {
      fetchAffiliateSettings(1)
    } else {
      setUserSettings([])
      onCountUpdate(0)
    }
  }, [selectedUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const getEventTitle = (setting: AffiliateSetting) => {
    if (typeof setting.event === 'object' && setting.event?.title) {
      return setting.event.title
    }
    return 'Unknown Event'
  }

  const handleCreateSetting = async (data: any) => {
    setIsLoading(true)
    try {
      // Format data for PayloadCMS - convert string IDs to integers
      const formattedData = {
        ...data,
        event: parseInt(data.event),
        affiliateUser: selectedUser.id,
        promotions:
          data.promotions?.map((promo: any) => ({
            ...promo,
            promotion: parseInt(promo.promotion),
          })) || [],
      }

      const response = await fetch('/api/affiliate-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsCreateModalOpen(false)
        // Refetch data to show the new setting
        await fetchAffiliateSettings(pagination.page)
        toast.success('Created successfully')
      } else {
        // Handle PayloadCMS validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors
            .map((error: any) => {
              if (error.data?.errors) {
                return error.data.errors
                  .map((fieldError: any) => `${fieldError.label}: ${fieldError.message}`)
                  .join('\n')
              }
              return error.message || 'Unknown error'
            })
            .join('\n')

          toast.error(`Validation Error:\n${errorMessages}`)
        } else {
          toast.error(`Error: ${result.message || 'Failed to create setting'}`)
        }
        console.error('Failed to create setting:', result)
      }
    } catch (error) {
      console.error('Error creating setting:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSetting = async (data: any) => {
    if (!editingSetting) return

    console.log('data handleEditSetting', data)

    setIsLoading(true)
    try {
      // Format data for PayloadCMS - convert string IDs to integers
      const formattedData = {
        ...data,
        event: parseInt(data.event),
        affiliateUser: parseInt(data.affiliateUser),
        promotions:
          data.promotions?.map((promo: any) => ({
            ...promo,
            promotion: parseInt(promo.promotion),
          })) || [],
      }

      console.log('formattedData', formattedData)

      const response = await fetch(`/api/affiliate-settings/${editingSetting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsEditModalOpen(false)
        setEditingSetting(null)
        // Refetch data to show the updated setting
        await fetchAffiliateSettings(pagination.page)
        toast.success('Updated successfully!')
      } else {
        // Handle PayloadCMS validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors
            .map((error: any) => {
              if (error.data?.errors) {
                return error.data.errors
                  .map((fieldError: any) => `${fieldError.label}: ${fieldError.message}`)
                  .join('\n')
              }
              return error.message || 'Unknown error'
            })
            .join('\n')

          toast.error(`Validation Error:\n${errorMessages}`)
        } else {
          toast.error(`Error: ${result.message || 'Failed to update setting'}`)
        }
        console.error('Failed to update setting:', result)
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (setting: AffiliateSetting) => {
    setEditingSetting(setting)
    setIsEditModalOpen(true)
  }

  const closeModals = () => {
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingSetting(null)
  }

  const handlePageChange = (newPage: number) => {
    fetchAffiliateSettings(newPage)
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
            Affiliate Settings
          </h3>
          <p
            style={{
              fontSize: 'var(--font-size-small)',
              color: 'var(--theme-elevation-600)',
              margin: 0,
            }}
          >
            Manage affiliate program configurations for {selectedUser.email}
          </p>
        </div>
        <Button
          buttonStyle="primary"
          size="small"
          className="m-0"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Add New Setting
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingData && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Settings />
              <h3>Loading Settings...</h3>
              <p>Please wait while we fetch the affiliate settings.</p>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Error State */}
      {error && !isLoadingData && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Settings />
              <h3>Error Loading Settings</h3>
              <p style={{ color: 'var(--theme-error-500)' }}>{error}</p>
              <Button
                buttonStyle="secondary"
                size="small"
                onClick={() => fetchAffiliateSettings(pagination.page)}
              >
                Try Again
              </Button>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Settings List */}
      {!isLoadingData && !error && userSettings.length > 0 && (
        <div>
          {userSettings.map((setting) => (
            <PayloadCard key={setting.id} className="payload-mb">
              <PayloadCardHeader>
                <div className="payload-flex payload-flex--between">
                  <div className="payload-flex payload-flex--gap">
                    <Settings
                      style={{ width: '20px', height: '20px', color: 'var(--theme-elevation-600)' }}
                    />
                    <div>
                      <PayloadCardTitle>{setting.name}</PayloadCardTitle>
                      <PayloadCardDescription>
                        Event: {getEventTitle(setting)} • Created:{' '}
                        {new Date(setting.createdAt).toLocaleString()} | Updated:{' '}
                        {new Date(setting.updatedAt).toLocaleString()}
                      </PayloadCardDescription>
                    </div>
                  </div>
                  <div className="payload-flex payload-flex--gap">
                    <PayloadBadge variant={setting.isActive ? 'success' : 'secondary'}>
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </PayloadBadge>
                    <Button
                      buttonStyle="icon-label"
                      size="small"
                      className="m-0"
                      onClick={() => openEditModal(setting)}
                    >
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </PayloadCardHeader>
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
                {pagination.totalDocs} settings
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
      {!isLoadingData && !error && userSettings.length === 0 && (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Settings />
              <h3>No Settings Found</h3>
              <p>
                This affiliate user does not have any settings configured yet. Create a new setting
                to get started.
              </p>
              <Button buttonStyle="primary" size="small" onClick={() => setIsCreateModalOpen(true)}>
                <div className="payload-flex payload-flex--gap">
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Create First Setting
                </div>
              </Button>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}

      {/* Create Modal */}
      <PayloadModal isOpen={isCreateModalOpen} onClose={closeModals}>
        <PayloadModalHeader>
          <PayloadModalTitle>Create Affiliate Setting</PayloadModalTitle>
        </PayloadModalHeader>
        <PayloadModalBody>
          <AffiliateSettingsForm
            selectedUser={selectedUser}
            onSubmit={handleCreateSetting}
            onCancel={closeModals}
            isLoading={isLoading}
          />
        </PayloadModalBody>
      </PayloadModal>

      {/* Edit Modal */}
      <PayloadModal isOpen={isEditModalOpen} onClose={closeModals}>
        <PayloadModalHeader>
          <PayloadModalTitle>Edit Affiliate Setting</PayloadModalTitle>
        </PayloadModalHeader>
        <PayloadModalBody>
          {editingSetting && (
            <AffiliateSettingsForm
              selectedUser={selectedUser}
              setting={editingSetting}
              onSubmit={handleEditSetting}
              onCancel={closeModals}
              isLoading={isLoading}
            />
          )}
        </PayloadModalBody>
      </PayloadModal>
    </div>
  )
}

export default AffiliateSettingsTab
