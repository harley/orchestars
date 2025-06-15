'use client'

// cSpell:words payloadcms
import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import type { User, AffiliateSetting } from '@/payload-types'
import { Settings, Plus, Edit } from 'lucide-react'
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

interface Props {
  selectedUser: User
  userSettings: AffiliateSetting[]
}

const AffiliateSettingsTab: React.FC<Props> = ({
  selectedUser,
  userSettings,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<AffiliateSetting | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

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
        affiliateUser: parseInt(data.affiliateUser),
        promotions: data.promotions?.map((promo: any) => ({
          ...promo,
          promotion: parseInt(promo.promotion)
        })) || []
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
        // Refresh the page to show the new setting
        alert('Create successfully!')
        window.location.reload()
      } else {
        // Handle PayloadCMS validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((error: any) => {
            if (error.data?.errors) {
              return error.data.errors.map((fieldError: any) =>
                `${fieldError.label}: ${fieldError.message}`
              ).join('\n')
            }
            return error.message || 'Unknown error'
          }).join('\n')

          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${result.message || 'Failed to create setting'}`)
        }
        console.error('Failed to create setting:', result)
      }
    } catch (error) {
      console.error('Error creating setting:', error)
      alert('Network error. Please try again.')
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
        promotions: data.promotions?.map((promo: any) => ({
          ...promo,
          promotion: parseInt(promo.promotion)
        })) || []
      }

      console.log('formattedData', formattedData)

      debugger

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
        // Refresh the page to show the updated setting
        alert('Updated successfully!')
        window.location.reload()
      } else {
        // Handle PayloadCMS validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map((error: any) => {
            if (error.data?.errors) {
              return error.data.errors.map((fieldError: any) =>
                `${fieldError.label}: ${fieldError.message}`
              ).join('\n')
            }
            return error.message || 'Unknown error'
          }).join('\n')

          alert(`Validation Error:\n${errorMessages}`)
        } else {
          alert(`Error: ${result.message || 'Failed to update setting'}`)
        }
        console.error('Failed to update setting:', result)
      }
    } catch (error) {
      console.error('Error updating setting:', error)
      alert('Network error. Please try again.')
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



  return (
    <div>
      {/* Header */}
      <div className="payload-flex payload-flex--between payload-mb">
        <div>
          <h3 style={{
            fontSize: 'var(--font-size-h4)',
            fontWeight: 'var(--font-weight-medium)',
            margin: '0 0 calc(var(--base) / 4) 0'
          }}>
            Affiliate Settings
          </h3>
          <p style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--theme-elevation-600)',
            margin: 0
          }}>
            Manage affiliate program configurations for {selectedUser.email}
          </p>
        </div>
        <Button
          buttonStyle="primary"
          size="small"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <div className="payload-flex payload-flex--gap">
            <Plus style={{ width: '16px', height: '16px' }} />
            Add New Setting
          </div>
        </Button>
      </div>

      {/* Settings List */}
      {userSettings.length > 0 ? (
        <div>
          {userSettings.map((setting) => (
            <PayloadCard key={setting.id} className="payload-mb">
              <PayloadCardHeader>
                <div className="payload-flex payload-flex--between">
                  <div className="payload-flex payload-flex--gap">
                    <Settings style={{ width: '20px', height: '20px', color: 'var(--theme-elevation-600)' }} />
                    <div>
                      <PayloadCardTitle>{setting.name}</PayloadCardTitle>
                      <PayloadCardDescription>
                        Event: {getEventTitle(setting)} • Created: {formatDate(setting.createdAt)}
                      </PayloadCardDescription>
                    </div>
                  </div>
                  <div className="payload-flex payload-flex--gap">
                    <PayloadBadge variant={setting.isActive ? "success" : "secondary"}>
                      {setting.isActive ? 'Active' : 'Inactive'}
                    </PayloadBadge>
                    <Button
                      buttonStyle="secondary"
                      size="small"
                      onClick={() => openEditModal(setting)}
                    >
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </PayloadCardHeader>
            </PayloadCard>
          ))}
        </div>
      ) : (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Settings />
              <h3>No Settings Found</h3>
              <p>
                This affiliate user does not have any settings configured yet.
                Create a new setting to get started.
              </p>
              <Button
                buttonStyle="primary"
                size="small"
                onClick={() => setIsCreateModalOpen(true)}
              >
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
      <PayloadModal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
      >
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
      <PayloadModal
        isOpen={isEditModalOpen}
        onClose={closeModals}
      >
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
