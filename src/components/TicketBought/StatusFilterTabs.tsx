'use client'
import React from 'react'

interface Props {
  statusFilter: 'all' | 'success' | 'processing' | 'cancelled'
  setStatusFilter: (val: 'all' | 'success' | 'processing' | 'cancelled') => void
  t: (key: string) => string
}

export const StatusFilterTabs: React.FC<Props> = ({ statusFilter, setStatusFilter, t }) => (
  <div className="flex gap-2 mb-6">
    <button className="btn-primary" onClick={() => setStatusFilter('all')}>{t('userprofile.all')}</button>
    <button className="btn-secondary" onClick={() => setStatusFilter('success')}>{t('userprofile.success')}</button>
    <button className="btn-secondary" onClick={() => setStatusFilter('processing')}>{t('userprofile.processing')}</button>
    <button className="btn-secondary" onClick={() => setStatusFilter('cancelled')}>{t('userprofile.cancelled')}</button>
  </div>
)
