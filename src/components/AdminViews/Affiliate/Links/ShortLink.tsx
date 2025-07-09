'use client'

import { Event, Promotion } from '@/payload-types'
import { TextInput, useField } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { Copy, CopyCheck } from 'lucide-react'
export const ShortLink = (props: { path: string } & Record<string, any>) => {
  const { value: eventId } = useField<string>({ path: 'event' })
  const { value: promotionId } = useField<string>({ path: 'affiliatePromotion' })
  const { setValue, value: slug } = useField<string>({ path: props.path })
  const [copied, setCopied] = useState(false)
  const [event, setEvent] = useState<Event | null>()
  const [promotion, setPromotion] = useState<Promotion | null>()
  const [prefixUrl, setPrefixUrl] = useState<string>('')

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

    setPrefixUrl(url)
  }, [])

  useEffect(() => {
    // if the slug is set, no need to set default
    if (slug) return
    let defaultSlug = ''

    if (event) {
      defaultSlug = `${event.slug}`
    }

    if (promotion?.code) {
      defaultSlug += `-${promotion.code.toLowerCase()}`
    }

    setValue(defaultSlug)
  }, [event, promotion, setValue, slug])

  const generateSlug = (length: number = 8): string => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let slug = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length)
      slug += letters[randomIndex]
    }

    setValue(slug)

    return slug
  }

  const handleCopy = async () => {
    if (slug) {
      try {
        const url = `${prefixUrl}/${slug}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000) // Reset copied state after 2 seconds
      } catch (err) {
        console.error('Failed to copy text:', err)
      }
    }
  }

  return (
    <div className="field-type json-field">
      <label className="field-label">Short Link</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Prefix URL */}
        <div style={{ whiteSpace: 'nowrap', marginRight: '8px' }}>
          {prefixUrl}
          <span style={{ margin: '0 4px' }}>/</span>
        </div>

        {/* Input */}
        <div style={{ flex: 1 }}>
          <TextInput
            path="slug"
            value={slug}
            placeholder={'Enter slug'}
            style={{
              textAlign: 'left',
              minWidth: '200px',
              width: '100%',
            }}
            onChange={(e) => {
              setValue(e.target.value)
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => generateSlug()}
            style={{
              height: '40px',
              padding: '0 12px',
              backgroundColor: '#222222',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              alignSelf: 'stretch',
              transition: 'background-color 0.2s',
            }}
          >
            Generate slug
          </button>
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
    </div>
  )
}

export default ShortLink
