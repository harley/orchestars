'use client'

import React, { useState } from 'react'
import { Button } from '@payloadcms/ui'
import type { User, AffiliateLink } from '@/payload-types'
import { Link, Plus, Edit, Copy, Eye } from 'lucide-react'
import {
  PayloadCard,
  PayloadCardContent,
  PayloadCardDescription,
  PayloadCardHeader,
  PayloadCardTitle,
  PayloadBadge
} from './PayloadUIComponents'

interface Props {
  selectedUser: User
  userLinks: AffiliateLink[]
}

const AffiliateLinksTab: React.FC<Props> = ({
  selectedUser,
  userLinks,
}) => {
  const [expandedLink, setExpandedLink] = useState<number | null>(null)
  const [copiedLink, setCopiedLink] = useState<number | null>(null)

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
            Affiliate Links
          </h3>
          <p style={{
            fontSize: 'var(--font-size-small)',
            color: 'var(--theme-elevation-600)',
            margin: 0
          }}>
            Manage affiliate links for {selectedUser.email}
          </p>
        </div>
        <Button buttonStyle="primary" size="small">
          <div className="payload-flex payload-flex--gap">
            <Plus style={{ width: '16px', height: '16px' }} />
            Create New Link
          </div>
        </Button>
      </div>

      {/* Links List */}
      {userLinks.length > 0 ? (
        <div>
          {userLinks.map((link) => (
            <PayloadCard key={link.id} className="payload-mb">
              <PayloadCardHeader>
                <div className="payload-flex payload-flex--between">
                  <div className="payload-flex payload-flex--gap">
                    <Link style={{ width: '20px', height: '20px', color: 'var(--theme-elevation-600)' }} />
                    <div>
                      <PayloadCardTitle>
                        {getEventTitle(link)}
                      </PayloadCardTitle>
                      <PayloadCardDescription>
                        Code: {link.affiliateCode} • Created: {formatDate(link.createdAt)}
                      </PayloadCardDescription>
                    </div>
                  </div>
                  <div className="payload-flex payload-flex--gap">
                    <PayloadBadge variant={getLinkStatus(link) === 'active' ? "success" : "secondary"}>
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
                    <Button buttonStyle="secondary" size="small">
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </Button>
                  </div>
                </div>
              </PayloadCardHeader>

              {expandedLink === link.id && (
                <PayloadCardContent>
                  <div>
                    <p style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--theme-elevation-600)',
                      margin: 'var(--base) 0'
                    }}>
                      Status: {getLinkStatus(link)} | Event: {getEventTitle(link)}
                    </p>

                    {link.targetLink && (
                      <div style={{
                        padding: 'var(--base)',
                        backgroundColor: 'var(--theme-elevation-50)',
                        borderRadius: 'var(--border-radius-s)',
                        marginBottom: 'var(--base)',
                        fontFamily: 'monospace',
                        fontSize: 'var(--font-size-small)',
                        wordBreak: 'break-all'
                      }}>
                        <strong>Target Link:</strong> {link.targetLink}
                      </div>
                    )}

                    <div style={{
                      fontSize: 'var(--font-size-small)',
                      color: 'var(--theme-elevation-600)',
                      borderTop: '1px solid var(--theme-elevation-200)',
                      paddingTop: 'calc(var(--base) / 2)',
                      marginTop: 'var(--base)'
                    }}>
                      Created: {new Date(link.createdAt).toLocaleString()} |
                      Updated: {new Date(link.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </PayloadCardContent>
              )}
            </PayloadCard>
          ))}
        </div>
      ) : (
        <PayloadCard>
          <PayloadCardContent>
            <div className="payload-empty-state">
              <Link />
              <h3>No Links Found</h3>
              <p>
                This affiliate user does not have any links created yet.
                Create a new link to get started.
              </p>
              <Button buttonStyle="primary" size="small">
                <div className="payload-flex payload-flex--gap">
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Create First Link
                </div>
              </Button>
            </div>
          </PayloadCardContent>
        </PayloadCard>
      )}
    </div>
  )
}

export default AffiliateLinksTab
