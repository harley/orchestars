'use client'

// cSpell:words payloadcms textlink
import React, { useState, useEffect } from 'react'
import { Button, SelectInput, toast } from '@payloadcms/ui'
import type { User, AffiliateLink, Event, Promotion } from '@/payload-types'
import { Copy, Check } from 'lucide-react'
import {
  PayloadFormGroup,
  PayloadLabel,
  PayloadInput,
  PayloadDescription,
  PayloadTextarea,
} from './PayloadUIComponents'
import qs from 'qs'

interface Props {
  selectedUser: User
  link?: AffiliateLink
  onSubmit: (data: AffiliateLinkFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface AffiliateLinkFormData {
  event: string
  affiliatePromotion: string
  promotionCode: string
  utmParams: {
    source: string
    medium: string
    campaign: string
    term: string
    content: string
  }
  targetLink: string
  status: string
}

const AffiliateLinkForm: React.FC<Props> = ({
  selectedUser: _selectedUser,
  link,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [events, setEvents] = useState<Event[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)
  const [formData, setFormData] = useState<AffiliateLinkFormData>({
    event:
      typeof link?.event === 'object' && link.event
        ? link.event.id.toString()
        : link?.event?.toString() || '',
    affiliatePromotion:
      typeof link?.affiliatePromotion === 'object' && link.affiliatePromotion
        ? link.affiliatePromotion.id.toString()
        : link?.affiliatePromotion?.toString() || '',
    promotionCode: link?.promotionCode || '',
    utmParams: {
      source: link?.utmParams?.source || '',
      medium: link?.utmParams?.medium || '',
      campaign: link?.utmParams?.campaign || '',
      term: link?.utmParams?.term || '',
      content: link?.utmParams?.content || '',
    },
    targetLink: link?.targetLink || '',
    status: link?.status || 'active',
  })

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsRes = await fetch('/api/events')
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          setEvents(eventsData.docs || [])
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
        toast.error('Failed to fetch events')
      }
    }

    fetchEvents()
  }, [])

  // Fetch promotions when event is selected
  useEffect(() => {
    const fetchPromotions = async () => {
      if (!formData.event) {
        setPromotions([])
        // Clear selected promotion when no event is selected
        setFormData((prev) => ({
          ...prev,
          affiliatePromotion: '',
          promotionCode: '',
        }))
        return
      }

      try {
        const queryStr = qs.stringify({
          where: {
            event: {
              equals: parseInt(formData.event),
            },
          },
          depth: 1,
          limit: 100,
        })

        const promotionsRes = await fetch(`/api/promotions?${queryStr}`)

        if (promotionsRes.ok) {
          const promotionsData = await promotionsRes.json()
          setPromotions(promotionsData.docs || [])

          // Clear selected promotion when event changes (unless it's the initial load with existing link data)
          if (
            !link ||
            (link &&
              typeof link.event === 'object' &&
              link.event?.id.toString() !== formData.event) ||
            (link && typeof link.event === 'number' && link.event.toString() !== formData.event)
          ) {
            setFormData((prev) => ({
              ...prev,
              affiliatePromotion: '',
              promotionCode: '',
            }))
          }
        } else {
          setPromotions([])
          setFormData((prev) => ({
            ...prev,
            affiliatePromotion: '',
            promotionCode: '',
          }))
        }
      } catch (error) {
        console.error('Failed to fetch promotions:', error)
        toast.error('Failed to fetch promotions')
        setPromotions([])
        setFormData((prev) => ({
          ...prev,
          affiliatePromotion: '',
          promotionCode: '',
        }))
      }
    }

    fetchPromotions()
  }, [formData.event]) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate target link automatically
  useEffect(() => {
    const generateTargetLink = () => {
      let url = ''

      if (typeof window !== 'undefined') {
        url = `${window.location.origin}`
      }

      url += '/events'

      // Find selected event
      const selectedEvent = events.find((e) => e.id.toString() === formData.event)
      if (selectedEvent) {
        url += `/${selectedEvent.slug}`
      }

      const params = new URLSearchParams()

      // Find selected promotion
      const selectedPromotion = promotions.find(
        (p) => p.id.toString() === formData.affiliatePromotion,
      )
      if (selectedPromotion) {
        params.append('apc', selectedPromotion.code)
      }

      if (formData.utmParams.source) {
        params.append('utm_source', formData.utmParams.source)
      }
      if (formData.utmParams.medium) {
        params.append('utm_medium', formData.utmParams.medium)
      }
      if (formData.utmParams.campaign) {
        params.append('utm_campaign', formData.utmParams.campaign)
      }
      if (formData.utmParams.term) {
        params.append('utm_term', formData.utmParams.term)
      }
      if (formData.utmParams.content) {
        params.append('utm_content', formData.utmParams.content)
      }

      if (params.toString()) {
        url = `${url}?${params.toString()}`
      }

      return url
    }

    const newTargetLink = generateTargetLink()
    setFormData((prev) => ({
      ...prev,
      targetLink: newTargetLink,
    }))
  }, [
    formData.event,
    formData.affiliatePromotion,
    formData.utmParams.source,
    formData.utmParams.medium,
    formData.utmParams.campaign,
    formData.utmParams.term,
    formData.utmParams.content,
    events,
    promotions,
  ])

  // Update promotion code when promotion is selected
  useEffect(() => {
    const selectedPromotion = promotions.find(
      (p) => p.id.toString() === formData.affiliatePromotion,
    )
    const newPromotionCode = selectedPromotion?.code || ''

    if (newPromotionCode !== formData.promotionCode) {
      setFormData((prev) => ({
        ...prev,
        promotionCode: newPromotionCode,
      }))
    }
  }, [formData.affiliatePromotion, formData.promotionCode, promotions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    // Validate required fields
    if (!formData.event.trim()) {
      const errorMsg = 'Event selection is required'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!formData.affiliatePromotion.trim()) {
      const errorMsg = 'Promotion selection is required'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!formData.targetLink.trim()) {
      const errorMsg = 'Target link could not be generated. Please select an event and promotion.'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate URL format
    try {
      new URL(formData.targetLink)
    } catch {
      const errorMsg = 'Generated target link is invalid'
      setErrorMessage(errorMsg)
      toast.error(errorMsg)
      return
    }

    await onSubmit(formData)
  }

  const updateFormData = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split('.')
      const newData = { ...prev }
      let current: any = newData

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        if (!key) continue

        if (!current[key]) current[key] = {}
        current = current[key]
      }

      const lastKey = keys[keys.length - 1]
      if (!lastKey) return newData

      current[lastKey] = value
      return newData
    })
  }

  const handleCopyTargetLink = async () => {
    if (!formData.targetLink.trim()) {
      return // Don't copy if there's no target link
    }

    try {
      await navigator.clipboard.writeText(formData.targetLink)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy target link:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = formData.targetLink
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
      }
      document.body.removeChild(textArea)
    }
  }

  // Promotions are already filtered by event from the API

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div
          style={{
            padding: 'calc(var(--base) / 2)',
            marginBottom: 'var(--base)',
            backgroundColor: 'var(--theme-error-50)',
            border: '1px solid var(--theme-error-500)',
            borderRadius: 'var(--border-radius-s)',
            color: 'var(--theme-error-500)',
            fontSize: 'var(--font-size-small)',
          }}
        >
          {errorMessage}
        </div>
      )}

      <PayloadFormGroup>
        <PayloadLabel htmlFor="event" required>
          Event
        </PayloadLabel>
        <PayloadDescription>Select the event this affiliate link applies to</PayloadDescription>
        <SelectInput
          path="event"
          name="event"
          options={[
            { label: 'Select an event', value: '' },
            ...events.map((event) => ({
              label: event.title || 'Untitled Event',
              value: event.id.toString(),
            })),
          ]}
          value={formData.event}
          onChange={(option) => updateFormData('event', (option as any)?.value || '')}
        />
      </PayloadFormGroup>

      <PayloadFormGroup>
        <PayloadLabel htmlFor="affiliatePromotion" required>
          Promotion
        </PayloadLabel>
        <PayloadDescription>Select a promotion to associate with this link</PayloadDescription>
        <SelectInput
          path="affiliatePromotion"
          name="affiliatePromotion"
          options={[
            { label: 'Select a promotion', value: '' },
            ...promotions.map((promotion: Promotion) => ({
              label: promotion.code,
              value: promotion.id.toString(),
            })),
          ]}
          value={formData.affiliatePromotion}
          onChange={(option) => updateFormData('affiliatePromotion', (option as any)?.value || '')}
        />
      </PayloadFormGroup>

      <PayloadFormGroup>
        <PayloadLabel htmlFor="promotionCode">Promotion Code (Auto-generated)</PayloadLabel>
        <PayloadDescription>
          This field is automatically populated based on the selected promotion
        </PayloadDescription>
        <PayloadInput
          id="promotionCode"
          value={formData.promotionCode}
          placeholder="Will be auto-generated"
          disabled
        />
      </PayloadFormGroup>

      <PayloadFormGroup>
        <PayloadLabel htmlFor="status">Status</PayloadLabel>
        <PayloadDescription>Set the status of this affiliate link</PayloadDescription>
        <SelectInput
          path="status"
          name="status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Disabled', value: 'disabled' },
          ]}
          value={formData.status}
          onChange={(option) => updateFormData('status', (option as any)?.value || '')}
        />
      </PayloadFormGroup>

      {/* UTM Parameters Section */}
      <div style={{ marginTop: 'var(--base)', marginBottom: 'var(--base)' }}>
        <h4
          style={{
            fontSize: 'var(--font-size-h5)',
            fontWeight: 'var(--font-weight-medium)',
            margin: '0 0 calc(var(--base) / 2) 0',
          }}
        >
          UTM Parameters (Optional)
        </h4>
        <PayloadDescription>
          Add UTM parameters for tracking campaign performance
        </PayloadDescription>
      </div>

      <div className="payload-grid payload-grid--cols-2 payload-grid--gap-md">
        <PayloadFormGroup>
          <PayloadLabel htmlFor="utm-source">UTM Source</PayloadLabel>
          <PayloadDescription>
            Traffic source (e.g., facebook, google, newsletter)
          </PayloadDescription>
          <PayloadInput
            id="utm-source"
            value={formData.utmParams.source}
            onChange={(e) => updateFormData('utmParams.source', e.target.value)}
            placeholder="facebook"
          />
        </PayloadFormGroup>

        <PayloadFormGroup>
          <PayloadLabel htmlFor="utm-medium">UTM Medium</PayloadLabel>
          <PayloadDescription>Marketing medium (e.g., cpc, email, social)</PayloadDescription>
          <PayloadInput
            id="utm-medium"
            value={formData.utmParams.medium}
            onChange={(e) => updateFormData('utmParams.medium', e.target.value)}
            placeholder="social"
          />
        </PayloadFormGroup>

        <PayloadFormGroup>
          <PayloadLabel htmlFor="utm-campaign">UTM Campaign</PayloadLabel>
          <PayloadDescription>Campaign name (e.g., summer-promo, holiday-sale)</PayloadDescription>
          <PayloadInput
            id="utm-campaign"
            value={formData.utmParams.campaign}
            onChange={(e) => updateFormData('utmParams.campaign', e.target.value)}
            placeholder="summer-promo"
          />
        </PayloadFormGroup>

        <PayloadFormGroup>
          <PayloadLabel htmlFor="utm-term">UTM Term</PayloadLabel>
          <PayloadDescription>Keywords (e.g., classical music, orchestra)</PayloadDescription>
          <PayloadInput
            id="utm-term"
            value={formData.utmParams.term}
            onChange={(e) => updateFormData('utmParams.term', e.target.value)}
            placeholder="classical music"
          />
        </PayloadFormGroup>
      </div>

      <PayloadFormGroup>
        <PayloadLabel htmlFor="utm-content">UTM Content</PayloadLabel>
        <PayloadDescription>
          Ad content or link identifier (e.g., banner1, textlink2)
        </PayloadDescription>
        <PayloadInput
          id="utm-content"
          value={formData.utmParams.content}
          onChange={(e) => updateFormData('utmParams.content', e.target.value)}
          placeholder="banner1"
        />
      </PayloadFormGroup>

      {/* Target Link at the bottom */}
      <PayloadFormGroup>
        <PayloadLabel htmlFor="targetLink">Target Link (Auto-generated)</PayloadLabel>
        <PayloadDescription>
          This URL is automatically generated based on the selected event, promotion, and UTM
          parameters
        </PayloadDescription>
        <PayloadTextarea
          id="targetLink"
          value={formData.targetLink}
          placeholder="Will be auto-generated"
          disabled
          rows={3}
        />
        <div style={{ marginTop: '8px', display: 'flex' }}>
          <Button
            type="button"
            buttonStyle="secondary"
            size="small"
            className='m-0'
            onClick={handleCopyTargetLink}
            disabled={!formData.targetLink.trim()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isCopied ? (
                <>
                  <Check style={{ width: '16px', height: '16px' }} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy style={{ width: '16px', height: '16px' }} />
                  Copy Link
                </>
              )}
            </div>
          </Button>
        </div>
      </PayloadFormGroup>

      <div
        className="payload-flex payload-flex--gap"
        style={{ justifyContent: 'flex-end', marginTop: 'var(--base)' }}
      >
        <Button type="button" buttonStyle="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" buttonStyle="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : link ? 'Update Link' : 'Create Link'}
        </Button>
      </div>
    </form>
  )
}

export default AffiliateLinkForm
