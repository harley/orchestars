'use client'

// cSpell:words eligTicketTypes payloadcms
import React, { useState, useEffect } from 'react'
import { Button, SelectInput, toast } from '@payloadcms/ui'
import type { User, AffiliateSetting, Event, Promotion } from '@/payload-types'
import { Plus, Trash2 } from 'lucide-react'
import {
  PayloadFormGroup,
  PayloadLabel,
  PayloadInput,
  PayloadTextarea,
  PayloadCheckbox,
  PayloadDescription,
  PayloadMultiSelect,
} from './PayloadUIComponents'
import qs from 'qs'

interface Props {
  selectedUser: User
  setting?: AffiliateSetting
  onSubmit: (data: AffiliateSettingFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

interface AffiliateSettingFormData {
  name: string
  event: string
  affiliateUser: string
  promotions: Array<{ promotion: string }>
  isActive: boolean
  description: string
  tiers: Array<{
    tierName: string
    tierLevel: number
    quaCriteria: {
      minTicketsSold: number
      maxTicketsSold?: number | null
      minNetRevenue?: number | null
      maxNetRevenue?: number | null
      eligTicketTypes: string[]
    }
    rewards: {
      commissionPercentage: number
      freeTickets: Array<{
        ticketClass: string
        quantity: number
        ticketValue?: number | null
      }>
    }
  }>
}

const TICKET_ZONES = [
  { label: 'Zone 1', value: 'zone1' },
  { label: 'Zone 2', value: 'zone2' },
  { label: 'Zone 3', value: 'zone3' },
  { label: 'Zone 4', value: 'zone4' },
  { label: 'Zone 5', value: 'zone5' },
]

const AffiliateSettingsForm: React.FC<Props> = ({
  selectedUser,
  setting,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [events, setEvents] = useState<Event[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [formData, setFormData] = useState<AffiliateSettingFormData>({
    name: setting?.name || '',
    event:
      typeof setting?.event === 'object'
        ? setting.event.id.toString()
        : setting?.event?.toString() || '',
    affiliateUser: selectedUser.id.toString(),
    promotions:
      setting?.promotions?.map((p) => ({
        promotion:
          typeof p.promotion === 'object' ? p.promotion.id.toString() : p.promotion.toString(),
      })) || [],
    isActive: setting?.isActive ?? true,
    description: setting?.description || '',
    tiers: setting?.tiers?.map((tier) => ({
      tierName: tier.tierName,
      tierLevel: tier.tierLevel,
      quaCriteria: {
        minTicketsSold: tier.quaCriteria.minTicketsSold,
        maxTicketsSold: tier.quaCriteria.maxTicketsSold,
        minNetRevenue: tier.quaCriteria.minNetRevenue,
        maxNetRevenue: tier.quaCriteria.maxNetRevenue,
        eligTicketTypes: tier.quaCriteria.eligTicketTypes || [],
      },
      rewards: {
        commissionPercentage: tier.rewards.commissionPercentage,
        freeTickets:
          tier.rewards.freeTickets?.map((ft) => ({
            ticketClass: ft.ticketClass,
            quantity: ft.quantity,
            ticketValue: ft.ticketValue,
          })) || [],
      },
    })) || [
      {
        tierName: '',
        tierLevel: 1,
        quaCriteria: {
          minTicketsSold: 1,
          maxTicketsSold: null,
          minNetRevenue: null,
          maxNetRevenue: null,
          eligTicketTypes: [],
        },
        rewards: {
          commissionPercentage: 0,
          freeTickets: [],
        },
      },
    ],
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
      }
    }

    fetchEvents()
  }, [])

  // Fetch promotions when event is selected
  useEffect(() => {
    const fetchPromotions = async () => {
      if (!formData.event) {
        setPromotions([])
        // Clear selected promotions when no event is selected
        setFormData((prev) => ({
          ...prev,
          promotions: [],
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

          // Clear selected promotions when event changes (unless it's the initial load with existing setting data)
          if (
            !setting ||
            (setting &&
              typeof setting.event === 'object' &&
              setting.event?.id.toString() !== formData.event) ||
            (setting &&
              typeof setting.event === 'number' &&
              setting.event.toString() !== formData.event)
          ) {
            setFormData((prev) => ({
              ...prev,
              promotions: [],
            }))
          }
        } else {
          setPromotions([])
          setFormData((prev) => ({
            ...prev,
            promotions: [],
          }))
        }
      } catch (error) {
        console.error('Failed to fetch promotions:', error)
        setPromotions([])
        setFormData((prev) => ({
          ...prev,
          promotions: [],
        }))
      }
    }

    fetchPromotions()
  }, [formData.event]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    // Validate required fields
    if (!formData.name.trim()) {
      setErrorMessage('Setting name is required')
      const msg = 'Setting name is required'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (!formData.event) {
      const msg = 'Event selection is required'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    if (formData.tiers.length === 0) {
      const msg = 'At least one tier is required'
      setErrorMessage(msg)
      toast.error(msg)
      return
    }

    // Validate each tier
    for (let i = 0; i < formData.tiers.length; i++) {
      const tier = formData.tiers[i]
      if (!tier || !tier.tierName.trim()) {
        const msg = `Tier ${i + 1}: Tier name is required`
        setErrorMessage(msg)
        toast.error(msg)
        return
      }
      if (tier.tierLevel < 1) {
        const msg = `Tier ${i + 1}: Tier level must be at least 1`
        setErrorMessage(msg)
        toast.error(msg)
        return
      }
      if (!tier.quaCriteria || tier.quaCriteria.minTicketsSold < 1) {
        const msg = `Tier ${i + 1}: Minimum tickets sold must be at least 1`
        setErrorMessage(msg)
        toast.error(msg)
        return
      }
      if (
        !tier.rewards ||
        tier.rewards.commissionPercentage < 0 ||
        tier.rewards.commissionPercentage > 100
      ) {
        const msg = `Tier ${i + 1}: Commission percentage must be between 0 and 100`
        setErrorMessage(msg)
        toast.error(msg)

        return
      }
    }

    if (formData.promotions?.length) {
      formData.promotions = formData.promotions.filter((promo) => !!promo.promotion)
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

        if (key.includes('[') && key.includes(']')) {
          const splitResult = key.split('[')
          const arrayKey = splitResult[0]
          const indexStr = splitResult[1]

          if (!arrayKey || !indexStr) continue

          const index = parseInt(indexStr.replace(']', ''))
          if (isNaN(index)) continue

          if (!current[arrayKey]) current[arrayKey] = []
          if (!current[arrayKey][index]) current[arrayKey][index] = {}
          current = current[arrayKey][index]
        } else {
          if (!current[key]) current[key] = {}
          current = current[key]
        }
      }

      const lastKey = keys[keys.length - 1]
      if (!lastKey) return newData

      if (lastKey.includes('[') && lastKey.includes(']')) {
        const splitResult = lastKey.split('[')
        const arrayKey = splitResult[0]
        const indexStr = splitResult[1]

        if (!arrayKey || !indexStr) return newData

        const index = parseInt(indexStr.replace(']', ''))
        if (isNaN(index)) return newData

        if (!current[arrayKey]) current[arrayKey] = []
        current[arrayKey][index] = value
      } else {
        current[lastKey] = value
      }

      return newData
    })
  }

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          tierName: '',
          tierLevel: prev.tiers.length + 1,
          quaCriteria: {
            minTicketsSold: 1,
            maxTicketsSold: null,
            minNetRevenue: null,
            maxNetRevenue: null,
            eligTicketTypes: [],
          },
          rewards: {
            commissionPercentage: 0,
            freeTickets: [],
          },
        },
      ],
    }))
  }

  const removeTier = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index),
    }))
  }

  const addFreeTicket = (tierIndex: number) => {
    const tier = formData.tiers[tierIndex]
    if (tier) {
      updateFormData(`tiers[${tierIndex}].rewards.freeTickets`, [
        ...tier.rewards.freeTickets,
        { ticketClass: 'zone1', quantity: 1, ticketValue: null },
      ])
    }
  }

  const removeFreeTicket = (tierIndex: number, ticketIndex: number) => {
    const tier = formData.tiers[tierIndex]
    if (tier) {
      const newFreeTickets = tier.rewards.freeTickets.filter((_, i) => i !== ticketIndex)
      updateFormData(`tiers[${tierIndex}].rewards.freeTickets`, newFreeTickets)
    }
  }

  const addPromotion = () => {
    setFormData((prev) => ({
      ...prev,
      promotions: [...prev.promotions, { promotion: '' }],
    }))
  }

  const removePromotion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== index),
    }))
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
        <PayloadLabel htmlFor="name" required>
          Setting Name
        </PayloadLabel>
        <PayloadDescription>
          A descriptive name for this affiliate tier configuration (e.g. &quot;Concert XYZ Affiliate
          Program&quot;)
        </PayloadDescription>
        <PayloadInput
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="e.g., Concert XYZ Affiliate Program"
        />
      </PayloadFormGroup>

      <PayloadFormGroup>
        <PayloadLabel htmlFor="event" required>
          Event
        </PayloadLabel>
        <PayloadDescription>The event this affiliate setting applies to</PayloadDescription>
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
        <PayloadLabel htmlFor="description">Description</PayloadLabel>
        <PayloadDescription>Optional description of this affiliate program</PayloadDescription>
        <PayloadTextarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Optional description of this affiliate program"
          rows={3}
        />
      </PayloadFormGroup>

      <PayloadFormGroup>
        <PayloadLabel>
          <PayloadCheckbox
            checked={formData.isActive}
            onChange={(e) => updateFormData('isActive', e.target.checked)}
          />
          Active
        </PayloadLabel>
        <PayloadDescription>Whether this affiliate setting is currently active</PayloadDescription>
      </PayloadFormGroup>

      {/* Promotions Section */}
      <PayloadFormGroup>
        <div className="payload-flex payload-flex--between">
          <PayloadLabel>Applied Promotions</PayloadLabel>
        </div>
        <PayloadDescription>Promotions that are valid for this affiliate user</PayloadDescription>
        {formData.promotions.map((promo, index) => (
          <div key={index} className="payload-flex payload-flex--gap payload-mb">
            <div style={{ flex: 1 }}>
              <SelectInput
                path={`promotions[${index}].promotion`}
                name={`promotions[${index}].promotion`}
                options={[
                  { label: 'Select a promotion', value: '' },
                  ...promotions.map((promotion: Promotion) => ({
                    label: promotion.code,
                    value: promotion.id.toString(),
                  })),
                ]}
                value={promo.promotion}
                onChange={(option) =>
                  updateFormData(`promotions[${index}].promotion`, (option as any)?.value || '')
                }
              />
            </div>
            <Button
              type="button"
              buttonStyle="secondary"
              size="small"
              className="m-0"
              onClick={() => removePromotion(index)}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
            </Button>
          </div>
        ))}
        <button type="button" className="m-0 cursor-pointer" onClick={addPromotion}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add Promotion
        </button>
      </PayloadFormGroup>

      {/* Tiers Section */}
      <PayloadFormGroup>
        <div className="payload-flex payload-flex--between payload-mb">
          <PayloadLabel required>Affiliate Tiers</PayloadLabel>
        </div>

        {formData.tiers.map((tier, tierIndex) => (
          <div key={tierIndex} className="payload-card payload-mb">
            <div className="payload-card__header">
              <div className="payload-flex payload-flex--between" style={{ alignItems: 'center' }}>
                <h4>Tier {tierIndex + 1}</h4>
                {formData.tiers.length > 1 && (
                  <button
                    type="button"
                    className="m-0 cursor-pointer"
                    onClick={() => removeTier(tierIndex)}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            </div>
            <div className="payload-card__content">
              <div className="payload-grid payload-grid--cols-2 payload-grid--gap-md">
                <PayloadFormGroup>
                  <PayloadLabel required>Tier Name</PayloadLabel>
                  <PayloadDescription>
                    Name for this tier (e.g. &quot;Beginner&quot;, &quot;Intermediate&quot;,
                    &quot;Professional&quot;)
                  </PayloadDescription>
                  <PayloadInput
                    value={tier.tierName}
                    onChange={(e) => updateFormData(`tiers[${tierIndex}].tierName`, e.target.value)}
                    placeholder="e.g., Beginner, Professional"
                  />
                </PayloadFormGroup>

                <PayloadFormGroup>
                  <PayloadLabel required>Tier Level</PayloadLabel>
                  <PayloadDescription>
                    Numeric level for this tier (1 = lowest, higher numbers = higher tiers)
                  </PayloadDescription>
                  <PayloadInput
                    type="number"
                    value={tier.tierLevel}
                    onChange={(e) =>
                      updateFormData(`tiers[${tierIndex}].tierLevel`, parseInt(e.target.value))
                    }
                    min={1}
                  />
                </PayloadFormGroup>
              </div>

              {/* Qualification Criteria */}
              <h5 style={{ margin: 'var(--base) 0 calc(var(--base) / 2) 0' }}>
                Qualification Criteria
              </h5>
              <PayloadDescription>Define how affiliates qualify for this tier</PayloadDescription>
              <div className="payload-grid payload-grid--cols-2 payload-grid--gap-md">
                <PayloadFormGroup>
                  <PayloadLabel required>Min Tickets Sold</PayloadLabel>
                  <PayloadDescription>
                    Minimum number of tickets that must be sold to reach this tier
                  </PayloadDescription>
                  <PayloadInput
                    type="number"
                    value={tier.quaCriteria.minTicketsSold}
                    onChange={(e) =>
                      updateFormData(
                        `tiers[${tierIndex}].quaCriteria.minTicketsSold`,
                        parseInt(e.target.value),
                      )
                    }
                    min={1}
                    required
                  />
                </PayloadFormGroup>

                <PayloadFormGroup>
                  <PayloadLabel>Max Tickets Sold</PayloadLabel>
                  <PayloadDescription>
                    Maximum number of tickets for this tier (leave empty for unlimited)
                  </PayloadDescription>
                  <PayloadInput
                    type="number"
                    value={tier.quaCriteria.maxTicketsSold || ''}
                    onChange={(e) =>
                      updateFormData(
                        `tiers[${tierIndex}].quaCriteria.maxTicketsSold`,
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    min={1}
                  />
                </PayloadFormGroup>

                <PayloadFormGroup>
                  <PayloadLabel>Min Net Revenue (VND)</PayloadLabel>
                  <PayloadDescription>
                    Alternative qualification: minimum net revenue in VND
                  </PayloadDescription>
                  <PayloadInput
                    type="number"
                    value={tier.quaCriteria.minNetRevenue || ''}
                    onChange={(e) =>
                      updateFormData(
                        `tiers[${tierIndex}].quaCriteria.minNetRevenue`,
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    min={0}
                  />
                </PayloadFormGroup>

                <PayloadFormGroup>
                  <PayloadLabel>Max Net Revenue (VND)</PayloadLabel>
                  <PayloadDescription>
                    Maximum net revenue for this tier (leave empty for unlimited)
                  </PayloadDescription>
                  <PayloadInput
                    type="number"
                    value={tier.quaCriteria.maxNetRevenue || ''}
                    onChange={(e) =>
                      updateFormData(
                        `tiers[${tierIndex}].quaCriteria.maxNetRevenue`,
                        e.target.value ? parseInt(e.target.value) : undefined,
                      )
                    }
                    min={0}
                  />
                </PayloadFormGroup>
              </div>

              {/* Eligible Ticket Types */}
              <PayloadFormGroup>
                <PayloadLabel>Eligible Ticket Types</PayloadLabel>
                <PayloadDescription>
                  Which ticket types count towards tier qualification (leave empty for all types)
                </PayloadDescription>
                <PayloadMultiSelect
                  options={TICKET_ZONES}
                  value={tier.quaCriteria.eligTicketTypes}
                  onChange={(values) =>
                    updateFormData(`tiers[${tierIndex}].quaCriteria.eligTicketTypes`, values)
                  }
                />
              </PayloadFormGroup>

              {/* Rewards */}
              <h5 style={{ margin: 'var(--base) 0 calc(var(--base) / 2) 0' }}>Tier Rewards</h5>
              <PayloadDescription>Define the rewards for reaching this tier</PayloadDescription>
              <PayloadFormGroup>
                <PayloadLabel required>Commission Percentage (%)</PayloadLabel>
                <PayloadDescription>
                  Percentage of net revenue to pay as commission (e.g. 5 for 5%)
                </PayloadDescription>
                <PayloadInput
                  type="number"
                  value={tier.rewards.commissionPercentage}
                  onChange={(e) =>
                    updateFormData(
                      `tiers[${tierIndex}].rewards.commissionPercentage`,
                      parseFloat(e.target.value),
                    )
                  }
                  min={0}
                  max={100}
                  step="0.1"
                  required
                />
              </PayloadFormGroup>

              {/* Free Tickets */}
              <div className="payload-flex payload-flex--between">
                <PayloadLabel>Free Ticket Rewards</PayloadLabel>
                <button
                  type="button"
                  onClick={() => addFreeTicket(tierIndex)}
                  className="m-0 cursor-pointer"
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
              <PayloadDescription>Free tickets awarded when reaching this tier</PayloadDescription>

              {tier.rewards.freeTickets.map((freeTicket, ticketIndex) => (
                <div
                  key={ticketIndex}
                  className="payload-card"
                  style={{ marginBottom: 'calc(var(--base) / 2)' }}
                >
                  <div className="payload-card__content">
                    <div className="payload-flex payload-flex--between payload-mb">
                      <span>Free Ticket {ticketIndex + 1}</span>
                      <button
                        type="button"
                        className="m-0 cursor-pointer"
                        onClick={() => removeFreeTicket(tierIndex, ticketIndex)}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                    <div className="payload-grid payload-grid--cols-3 payload-grid--gap-md">
                      <PayloadFormGroup>
                        <PayloadLabel required>Ticket Class</PayloadLabel>
                        <PayloadDescription>
                          Class of free ticket to award. The value decreases by zone, with Zone 1
                          being the most expensive ticket.
                        </PayloadDescription>
                        <SelectInput
                          path={`tiers[${tierIndex}].rewards.freeTickets[${ticketIndex}].ticketClass`}
                          name={`tiers[${tierIndex}].rewards.freeTickets[${ticketIndex}].ticketClass`}
                          options={TICKET_ZONES.map((zone) => ({
                            label: zone.label,
                            value: zone.value,
                          }))}
                          value={freeTicket.ticketClass}
                          onChange={(option) =>
                            updateFormData(
                              `tiers[${tierIndex}].rewards.freeTickets[${ticketIndex}].ticketClass`,
                              (option as any)?.value || '',
                            )
                          }
                        />
                      </PayloadFormGroup>

                      <PayloadFormGroup>
                        <PayloadLabel required>Quantity</PayloadLabel>
                        <PayloadDescription>Number of free tickets to award</PayloadDescription>
                        <PayloadInput
                          type="number"
                          value={freeTicket.quantity}
                          onChange={(e) =>
                            updateFormData(
                              `tiers[${tierIndex}].rewards.freeTickets[${ticketIndex}].quantity`,
                              parseInt(e.target.value),
                            )
                          }
                          min={1}
                          required
                        />
                      </PayloadFormGroup>

                      <PayloadFormGroup>
                        <PayloadLabel>Ticket Value (VND)</PayloadLabel>
                        <PayloadDescription>
                          Amount (in VND) to be used as a substitute if free tickets are not
                          available.
                        </PayloadDescription>
                        <PayloadInput
                          type="number"
                          value={freeTicket.ticketValue || ''}
                          onChange={(e) =>
                            updateFormData(
                              `tiers[${tierIndex}].rewards.freeTickets[${ticketIndex}].ticketValue`,
                              e.target.value ? parseInt(e.target.value) : undefined,
                            )
                          }
                          min={0}
                        />
                      </PayloadFormGroup>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button type="button" className="m-0 cursor-pointer" onClick={addTier}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add Affiliate Tier
        </button>
      </PayloadFormGroup>

      <div
        className="payload-flex payload-flex--gap"
        style={{ justifyContent: 'flex-end', marginTop: 'var(--base)' }}
      >
        <Button type="button" buttonStyle="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" buttonStyle="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : setting ? 'Update Setting' : 'Create Setting'}
        </Button>
      </div>
    </form>
  )
}

export default AffiliateSettingsForm
