'use client'

import { Event, Promotion } from '@/payload-types'
import { TextareaInput, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { Copy, CopyCheck } from 'lucide-react'
export const TargetLink = (props: { path: string } & Record<string, any>) => {
  const { value: eventId } = useField<string>({ path: 'event' })
  const { value: promotionId } = useField<string>({ path: 'affiliatePromotion' })
  const { value: utmSource } = useField<string>({ path: 'utmParams.source' })
  const { value: utmMedium } = useField<string>({ path: 'utmParams.medium' })
  const { value: utmCampaign } = useField<string>({ path: 'utmParams.campaign' })
  const { value: utmTerm } = useField<string>({ path: 'utmParams.term' })
  const { value: utmContent } = useField<string>({ path: 'utmParams.content' })
  const { setValue, value: targetLink } = useField<string>({ path: props.path })
  const [copied, setCopied] = useState(false)
  const [event, setEvent] = useState<Event | null>()
  const [promotion, setPromotion] = useState<Promotion | null>()

  useEffect(() => {
    if (!eventId) {
      return setEvent(null)
    }

    fetch(`/api/events/${eventId}`)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error(`Failed to fetch event by ${eventId}`)
      })
      .then((eventData) => {
        setEvent(eventData)
      })
      .catch((err) => {
        console.log('error while fetching event detail', err)
      })
  }, [eventId])

  useEffect(() => {
    if (!promotionId) {
      return setPromotion(null)
    }

    fetch(`/api/promotions/${promotionId}`)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        throw new Error(`Failed to fetch promotion by ${promotionId}`)
      })
      .then((promotionData) => {
        setPromotion(promotionData)
      })
      .catch((err) => {
        console.log('error while fetching promotion detail', err)
      })
  }, [promotionId])

  useEffect(() => {
    let url = ''

    if (typeof window !== 'undefined') {
      url = `${window.location.origin}`
    }

    url += '/events'

    if (event) {
      url += `/${event.slug}`
    }

    const params = new URLSearchParams()

    // as affiliate promotion code
    if (promotion) {
      params.append('apc', promotion.code)
    }

    if (utmSource) {
      params.append('utm_source', utmSource)
    }
    if (utmMedium) {
      params.append('utm_medium', utmMedium)
    }
    if (utmCampaign) {
      params.append('utm_campaign', utmCampaign)
    }
    if (utmTerm) {
      params.append('utm_term', utmTerm)
    }
    if (utmContent) {
      params.append('utm_content', utmContent)
    }

    url = `${url}?${params.toString()}`

    setValue(url)
  }, [event, promotion, setValue, utmSource, utmMedium, utmCampaign, utmTerm, utmContent])

  const handleCopy = async () => {
    if (targetLink) {
      try {
        await navigator.clipboard.writeText(targetLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000) // Reset copied state after 2 seconds
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }

  return (
    <div className="field-type json-field">
      <label className="field-label">Target Link</label>
      <div style={{ display: 'flex', gap: '2px' }}>
        <TextareaInput
          path="note"
          value={targetLink}
          style={{
            textAlign: 'left',
            flex: 1,
          }}
          readOnly
        />
        <button
          type="button"
          onClick={handleCopy}
          style={{
            height: '40px',
            padding: '0 12px',
            backgroundColor: !copied ? '#222222' : '#046c04',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            alignSelf: 'stretch',
            transition: 'background-color 0.2s',
          }}
        >
          {copied ? <CopyCheck /> : <Copy />}
        </button>
      </div>
    </div>
  )
}

export default TargetLink
