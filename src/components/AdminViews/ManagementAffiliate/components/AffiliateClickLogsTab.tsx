'use client'

import React, { useState, useMemo } from 'react'
import { Button, SelectInput } from '@payloadcms/ui'
import type { User, AffiliateClickLog } from '@/payload-types'
import { MousePointer, Filter, Calendar, MapPin, Globe } from 'lucide-react'
import {
  PayloadCard,
  PayloadCardContent,
  PayloadCardDescription,
  PayloadCardHeader,
  PayloadCardTitle,
  PayloadInput,
  PayloadTable,
  PayloadTableHeader,
  PayloadTableBody,
  PayloadTableRow,
  PayloadTableHead,
  PayloadTableCell,
  PayloadGrid,
  PayloadGridItem
} from './PayloadUIComponents'

interface Props {
  clickLogs: AffiliateClickLog[]
  affiliateUsers: User[]
}

const AffiliateClickLogsTab: React.FC<Props> = ({
  clickLogs,
  affiliateUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Prepare user filter options
  const userFilterOptions = [
    { label: 'All Users', value: '' },
    ...affiliateUsers.map(user => ({
      label: `${user.email} ${user.firstName && user.lastName ? `(${user.firstName} ${user.lastName})` : ''}`,
      value: user.id.toString(),
    }))
  ]

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let filtered = clickLogs

    // Filter by selected user
    if (selectedUser) {
      filtered = filtered.filter(log => {
        if (typeof log.affiliateUser === 'object') {
          return log.affiliateUser?.id.toString() === selectedUser
        }
        return log.affiliateUser?.toString() === selectedUser
      })
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(log => {
        const userEmail = typeof log.affiliateUser === 'object' 
          ? log.affiliateUser?.email?.toLowerCase() || ''
          : ''
        const ip = log.ip?.toLowerCase() || ''
        const location = log.location?.toLowerCase() || ''
        const referrer = log.referrer?.toLowerCase() || ''
        
        return userEmail.includes(term) || 
               ip.includes(term) || 
               location.includes(term) || 
               referrer.includes(term)
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [clickLogs, selectedUser, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleUserFilterChange = (option: any) => {
    setSelectedUser(option?.value || '')
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div>
      {/* Header and Stats */}
      <PayloadCard>
        <PayloadCardHeader>
          <PayloadCardTitle>
            <div className="payload-flex payload-flex--gap">
              <MousePointer style={{ width: '20px', height: '20px' }} />
              Affiliate Click Logs
            </div>
          </PayloadCardTitle>
          <PayloadCardDescription>
            Track and analyze affiliate link clicks across all users
          </PayloadCardDescription>
        </PayloadCardHeader>
        <PayloadCardContent>
          <PayloadGrid cols={3} gap="md">
            <PayloadGridItem>
              <div style={{
                textAlign: 'center',
                padding: 'var(--base)',
                backgroundColor: 'var(--theme-success-50)',
                borderRadius: 'var(--border-radius-s)',
                border: '1px solid var(--theme-success-200)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--theme-success-600)',
                  marginBottom: 'calc(var(--base) / 4)'
                }}>
                  {clickLogs.length}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--theme-success-600)'
                }}>
                  Total Clicks
                </div>
              </div>
            </PayloadGridItem>
            <PayloadGridItem>
              <div style={{
                textAlign: 'center',
                padding: 'var(--base)',
                backgroundColor: 'var(--theme-success-50)',
                borderRadius: 'var(--border-radius-s)',
                border: '1px solid var(--theme-success-200)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--theme-success-600)',
                  marginBottom: 'calc(var(--base) / 4)'
                }}>
                  {filteredLogs.length}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--theme-success-600)'
                }}>
                  Filtered Results
                </div>
              </div>
            </PayloadGridItem>
            <PayloadGridItem>
              <div style={{
                textAlign: 'center',
                padding: 'var(--base)',
                backgroundColor: 'var(--theme-success-50)',
                borderRadius: 'var(--border-radius-s)',
                border: '1px solid var(--theme-success-200)'
              }}>
                <div style={{
                  fontSize: 'var(--font-size-h3)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--theme-success-600)',
                  marginBottom: 'calc(var(--base) / 4)'
                }}>
                  {new Set(clickLogs.map(log => log.ip)).size}
                </div>
                <div style={{
                  fontSize: 'var(--font-size-small)',
                  color: 'var(--theme-success-600)'
                }}>
                  Unique IPs
                </div>
              </div>
            </PayloadGridItem>
          </PayloadGrid>
        </PayloadCardContent>
      </PayloadCard>

      {/* Filters */}
      <PayloadCard className="payload-mt payload-card--dropdown">
        <PayloadCardHeader>
          <PayloadCardTitle>
            <div className="payload-flex payload-flex--gap">
              <Filter style={{ width: '20px', height: '20px' }} />
              Filters
            </div>
          </PayloadCardTitle>
        </PayloadCardHeader>
        <PayloadCardContent className="payload-card__content--dropdown">
          <PayloadGrid cols={2} gap="md">
            <PayloadGridItem>
              <div className="field-type">
                <label className="field-label">Search</label>
                <div style={{ position: 'relative' }}>
                  <PayloadInput
                    placeholder="Search by email, IP, location, or referrer..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>
            </PayloadGridItem>
            <PayloadGridItem>
              <div className="field-type">
                <label className="field-label">Filter by User</label>
                <SelectInput
                  path="userFilter"
                  name="userFilter"
                  options={userFilterOptions}
                  value={selectedUser}
                  onChange={handleUserFilterChange}
                />
              </div>
            </PayloadGridItem>
          </PayloadGrid>
        </PayloadCardContent>
      </PayloadCard>

      {/* Click Logs Table */}
      <PayloadCard className="payload-mt">
        <PayloadCardHeader>
          <PayloadCardTitle>Click Logs</PayloadCardTitle>
          <PayloadCardDescription>
            Showing {paginatedLogs.length} of {filteredLogs.length} results
          </PayloadCardDescription>
        </PayloadCardHeader>
        <PayloadCardContent>
          <PayloadTable>
            <PayloadTableHeader>
              <PayloadTableRow>
                <PayloadTableHead>User</PayloadTableHead>
                <PayloadTableHead>Date & Time</PayloadTableHead>
                <PayloadTableHead>IP Address</PayloadTableHead>
                <PayloadTableHead>Location</PayloadTableHead>
                <PayloadTableHead>Referrer</PayloadTableHead>
              </PayloadTableRow>
            </PayloadTableHeader>
            <PayloadTableBody>
              {paginatedLogs.map((log) => (
                <PayloadTableRow key={log.id}>
                  <PayloadTableCell>
                    <div>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {typeof log.affiliateUser === 'object' && log.affiliateUser?.email
                          ? log.affiliateUser.email
                          : 'Unknown User'}
                      </div>
                      {typeof log.affiliateUser === 'object' &&
                       log.affiliateUser?.firstName &&
                       log.affiliateUser?.lastName && (
                        <div style={{
                          fontSize: 'var(--font-size-small)',
                          color: 'var(--theme-elevation-600)'
                        }}>
                          {log.affiliateUser.firstName} {log.affiliateUser.lastName}
                        </div>
                      )}
                    </div>
                  </PayloadTableCell>
                  <PayloadTableCell>
                    <div className="payload-flex payload-flex--gap">
                      <Calendar style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
                      <span>{formatDate(log.createdAt)}</span>
                    </div>
                  </PayloadTableCell>
                  <PayloadTableCell>
                    <div className="payload-flex payload-flex--gap">
                      <Globe style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
                      <span style={{ fontFamily: 'monospace' }}>{log.ip || 'N/A'}</span>
                    </div>
                  </PayloadTableCell>
                  <PayloadTableCell>
                    <div className="payload-flex payload-flex--gap">
                      <MapPin style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-600)' }} />
                      <span>{log.location || 'Unknown'}</span>
                    </div>
                  </PayloadTableCell>
                  <PayloadTableCell>
                    <div style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.referrer || 'Direct'}
                    </div>
                  </PayloadTableCell>
                </PayloadTableRow>
              ))}
            </PayloadTableBody>
          </PayloadTable>

          {paginatedLogs.length === 0 && (
            <div className="payload-empty-state">
              <MousePointer />
              <h3>No Click Logs Found</h3>
              <p>
                {filteredLogs.length === 0 && clickLogs.length > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'No affiliate link clicks have been recorded yet.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="payload-flex payload-flex--between payload-mt">
              <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--theme-elevation-600)' }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="payload-flex payload-flex--gap">
                <Button
                  buttonStyle="secondary"
                  size="small"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  buttonStyle="secondary"
                  size="small"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </PayloadCardContent>
      </PayloadCard>
    </div>
  )
}

export default AffiliateClickLogsTab
