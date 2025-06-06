'use client'

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller, FormProvider } from 'react-hook-form'
import {
  Button,
  Gutter,
  TextInput,
  SelectInput,
  TextareaInput,
  toast,
  useTranslation,
} from '@payloadcms/ui'
import { formatMoney } from '@/utilities/formatMoney'
import axios from 'axios'
import { Event, Media, Promotion, PromotionConfig, SeatingChart } from '@/payload-types'
import { EventSchedule, TicketPrice } from '@/types/Event'
import { format as formatDate } from 'date-fns'
import SelectOrderCategory from './SelectOrderCategory/SelectOrderCategory'
import { EventSeatChartData } from '@/components/EventDetail/types/SeatChart'
import PromotionListCheckbox from './PromotionListCheckbox'
import { calculateMultiPromotionsTotalOrder, TicketSelected } from '@/components/EventDetail/SeatReservation/SeatMapSelection/utils/calculateTotal'

// --- Types ---
type SeatSelection = {
  ticketPriceId: string // ticketPriceId
  seat: string // seat
  price: number // price
  ticketPriceInfo?: TicketPrice
}
type FormValues = {
  eventId?: string
  eventScheduleId?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  orderItems: SeatSelection[]
  adjustedTotal?: number
  note?: string
  currency?: string
  category?: string
}

type FreeSeat = {
  id: string
  ticketPriceName?: string
  label: string
  value: string
  seat: string
  eventScheduleId?: string
  ticketPriceInfo?: TicketPrice
}

export const CreateOrderForm: React.FC<{ events: Event[] }> = ({ events }) => {
  const { t } = useTranslation()
  const formMethods = useForm<FormValues>({
    defaultValues: {
      orderItems: [{ ticketPriceId: '', seat: '', price: 0 }],
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset: resetForm,
  } = formMethods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'orderItems',
  })
  const [selectedEvent, setSelectedEvent] = React.useState<Event | undefined>()
  const [ticketClasses, setTicketClasses] = React.useState<
    (TicketPrice & { label: string; value: string })[]
  >([])
  const [freeSeats, setFreeSeats] = React.useState<FreeSeat[]>([])
  const [eventSchedules, setEventSchedules] = React.useState<
    (EventSchedule & { label: string; value: string; date: string })[]
  >([])

  // When eventId changes, update selectedEvent, ticketClasses, and eventDates
  const eventId = watch('eventId')
  const eventScheduleId = watch('eventScheduleId')
  
  useEffect(() => {
    if (eventId) {
      const event = events.find((e) => e.id === Number(eventId))
      setSelectedEvent(event)
      setTicketClasses(
        (event?.ticketPrices || []).map((ticketPrice) => ({
          id: ticketPrice.id as string,
          label: ticketPrice.name as string,
          value: ticketPrice.id as string,
          ticketPrice,
        })),
      )
      setEventSchedules(
        event?.schedules?.map((s) => ({
          id: s.id as string,
          label: s.date ? formatDate(s.date, 'yyyy-MM-dd') : '',
          value: s.id as string,
          date: s.date ? formatDate(s.date, 'yyyy-MM-dd') : '',
          schedule: s,
        })) || [],
      )
    } else {
      setSelectedEvent(undefined)
      setTicketClasses([])
      setEventSchedules([])
    }
    // Reset eventScheduleId and seats when event changes
    setValue('eventScheduleId', undefined)
    setValue('orderItems', [{ ticketPriceId: '', seat: '', price: 0 }])
  }, [eventId, events, setValue])

  const [allSeats, setAllSeats] = useState<EventSeatChartData['seats']>([])

  useEffect(() => {
    const seatChartUrl = ((selectedEvent?.seatingChart as SeatingChart)?.seatMap as Media)?.url
    if (!seatChartUrl) {
      return
    }

    fetch(seatChartUrl)
      .then((res) => res.json())
      .then((data: EventSeatChartData) => {
        setAllSeats(data.seats)
      })
      .catch((err) => {
        console.error('Error fetching seat chart:', err)
      })
  }, [selectedEvent?.seatingChart])

  // Fetch mock data
  useEffect(() => {
    if (selectedEvent && eventScheduleId && allSeats?.length) {
      axios
        .get(
          `/api/tickets/booked-seats?eventId=${selectedEvent.id}&eventScheduleId=${eventScheduleId}`,
        )
        .then((res) => {
          const bookedSeats = (res.data.data as string[]) || []

          const freeSeats: FreeSeat[] = []
          allSeats.forEach((s) => {
            if (!bookedSeats.includes(s.label.toUpperCase())) {
              const ticketPriceInfo = selectedEvent?.ticketPrices?.find(
                (tPrice) => tPrice.key === s.category,
              )
              freeSeats.push({
                id: s.label,
                ticketPriceName: ticketPriceInfo?.name || '',
                label: s.label,
                value: s.label,
                seat: s.label,
                eventScheduleId,
                ticketPriceInfo,
              })
            }
          })
          setFreeSeats(freeSeats)
        })
        .catch((err) => {
          console.error('error when loading booked seats', err)
        })
    } else {
      setFreeSeats([])
    }
  }, [eventScheduleId, selectedEvent, allSeats])

  // Watch seats for duplicate seat name validation and price auto-fill
  const orderItems = watch('orderItems') || []

  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [eventPromotionConfig, setEventPromotionConfig] = useState<PromotionConfig>()
  const [selectedPromotions, setSelectedPromotions] = useState<Promotion[]>([])
  
  useEffect(() => {
    if (!eventId) {
      setPromotions([])
      setEventPromotionConfig(undefined)
      setSelectedPromotions([])
      return
    }
    fetch(`/api/promotion?eventId=${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setPromotions(data?.promotions || [])
        setEventPromotionConfig(data?.eventPromotionConfig)
      })
      .catch((err) => {
        console.log('Error while fetching promotions', err)
      })
  }, [eventId])

  // Form submit
  const onSubmit = async (data: FormValues) => {
    try {
      // Transform form data to match AdminCreateOrderData
      const customer = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        email: data.email,
      }
      const orderItems = (data.orderItems || []).map((seat) => ({
        price: seat.price,
        quantity: 1,
        seat: seat.seat,
        eventId: Number(data.eventId),
        ticketPriceId: seat.ticketPriceId,
        eventScheduleId: data.eventScheduleId || '',
      }))
      const order = {
        currency: data.currency || 'VND',
        category: data.category,
        orderItems,
        promotionCodes: selectedPromotions.map((promotion) => promotion.code),
        adjustedTotal:
          data.adjustedTotal !== undefined &&
          data.adjustedTotal !== null &&
          String(data.adjustedTotal) !== ''
            ? Number(data.adjustedTotal)
            : undefined,
        note: data.note,
      }
      const payload = { customer, order }

      await axios.post('/api/orders/custom/create-order', payload)

      toast.success(t('general:successfullyCreated', { label: 'Order' }))

      resetForm({ orderItems: [{ ticketPriceId: '', seat: '', price: 0 }] })
      setSelectedPromotions([])
    } catch (error: any) {
      console.log('error', error)
      const messageError = error?.response?.data?.message || t('message.errorOccurred' as any)

      toast.error(messageError)
    }
  }


  const isAllowApplyMultiplePromotions =
    eventPromotionConfig?.validationRules?.allowApplyingMultiplePromotions
  const maxAppliedPromotions = eventPromotionConfig?.validationRules?.maxAppliedPromotions || 1

  const ticketSelected = orderItems.reduce((obj, oItem) => {

    if(!oItem.ticketPriceInfo || !oItem.seat) {
      return obj
    }

    const ticketName = oItem.ticketPriceInfo?.name as string
    if (!obj[ticketName]) {
      obj[ticketName] = {
        id: oItem.ticketPriceId,
        ticketName: ticketName,
        seats: [],
        total: 0,
        quantity: 0,
      }
    }

    obj[ticketName].seats.push(oItem.seat)
    obj[ticketName].total += oItem.price
    obj[ticketName].quantity += 1

    return obj
  }, {} as TicketSelected)
  
  const calculateTotal = calculateMultiPromotionsTotalOrder(
    selectedPromotions,
    ticketSelected,
    selectedEvent as Event,
  )

  // Compute total
  const adjustedTotal = watch('adjustedTotal')
  const totalAmount =
    adjustedTotal !== undefined && adjustedTotal !== null && String(adjustedTotal) !== ''
      ? Number(adjustedTotal)
      : calculateTotal.amount

  // Prevent duplicate seat names
  const seatNameCounts = orderItems.reduce<Record<string, number>>((acc, seat) => {
    if (seat.seat) acc[seat.seat] = (acc[seat.seat] || 0) + 1
    return acc
  }, {})

  return (
    <Gutter>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <fieldset style={{ marginBottom: 24 }}>
            <legend>Event Info</legend>
            <div style={{ marginBottom: 16 }}>
              <label>Event *</label>
              <Controller
                control={control}
                name="eventId"
                rules={{ required: 'Event is required' }}
                render={({ field }) => (
                  <SelectInput
                    path="eventId"
                    name={field.name}
                    options={[
                      { label: 'Select event...', value: '' },
                      ...events.map((ev) => ({
                        label: ev.title as string,
                        value: String(ev.id),
                        event: ev,
                      })),
                    ]}
                    value={field.value ?? ''}
                    onChange={(option) =>
                      field.onChange(
                        Array.isArray(option) ? (option[0]?.value ?? '') : (option?.value ?? ''),
                      )
                    }
                  />
                )}
              />
              {errors.eventId && (
                <div style={{ color: 'red', fontSize: 12 }}>{errors.eventId.message}</div>
              )}
            </div>
            <div style={{ marginBottom: 0 }}>
              <label>Event Date *</label>
              <Controller
                control={control}
                name="eventScheduleId"
                rules={{ required: 'Event date is required' }}
                render={({ field }) =>
                  selectedEvent ? (
                    <SelectInput
                      path="eventScheduleId"
                      name={field.name}
                      options={[{ label: 'Select date...', value: '' }, ...eventSchedules]}
                      value={field.value ?? ''}
                      onChange={(option) =>
                        field.onChange(
                          Array.isArray(option) ? (option[0]?.value ?? '') : (option?.value ?? ''),
                        )
                      }
                    />
                  ) : (
                    <div style={{ pointerEvents: 'none', opacity: 0.5 }}>
                      <SelectInput
                        path="eventScheduleId"
                        name={field.name}
                        options={[{ label: 'Select date...', value: '' }, ...eventSchedules]}
                        value={field.value ?? ''}
                        // onChange={(option) => {}}
                      />
                    </div>
                  )
                }
              />
              {errors.eventScheduleId && (
                <div style={{ color: 'red', fontSize: 12 }}>{errors.eventScheduleId.message}</div>
              )}
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: 24 }}>
            <legend>Seat Selections</legend>
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 0 }}>
              <div
                style={{
                  display: 'flex',
                  fontWeight: 600,
                  borderBottom: '1px solid #eee',
                  padding: '8px 12px',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 2, minWidth: 160 }}>Ticket Class</div>
                <div style={{ flex: 2, minWidth: 160 }}>Seat Name</div>
                <div style={{ flex: 1, minWidth: 100 }}>Ticket Price</div>
                <div style={{ width: 40 }}></div>
              </div>
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    borderBottom: idx === fields.length - 1 ? 'none' : '1px solid #eee',
                    padding: '8px 12px',
                  }}
                >
                  <div style={{ flex: 2, minWidth: 160 }}>
                    <Controller
                      control={control}
                      name={`orderItems.${idx}.ticketPriceId`}
                      rules={{ required: 'Ticket class required' }}
                      render={({ field }) => (
                        <SelectInput
                          path={`orderItems.${idx}.ticketPriceId`}
                          options={[{ label: 'Select...', value: '' }, ...ticketClasses]}
                          value={field.value ?? ''}
                          onChange={(option) => {
                            const selectedTicketClass = Array.isArray(option) ? option[0] : option

                            setValue(`orderItems.${idx}.seat`, '')
                            setValue(`orderItems.${idx}.ticketPriceInfo`, (selectedTicketClass as any)?.ticketPrice as TicketPrice)
                            setValue(
                              `orderItems.${idx}.price`,
                              (selectedTicketClass?.ticketPrice as TicketPrice)?.price || 0,
                            )

                            return field.onChange(selectedTicketClass?.value ?? '')
                          }}
                          name={field.name}
                        />
                      )}
                    />
                    {errors.orderItems?.[idx]?.ticketPriceId && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {errors.orderItems?.[idx]?.ticketPriceId?.message}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 2, minWidth: 160 }}>
                    <Controller
                      control={control}
                      name={`orderItems.${idx}.seat`}
                      rules={{
                        required: 'Seat name required',
                        validate: (value) =>
                          (seatNameCounts?.[value] as number) > 1 ? 'Duplicate seat name' : true,
                      }}
                      render={({ field }) => {
                        const orderItem = orderItems[idx]
                        let seatOptions: FreeSeat[] = []
                        if (orderItem?.ticketPriceId) {
                          seatOptions = freeSeats.filter(
                            (seat) => seat.ticketPriceInfo?.id === orderItem?.ticketPriceId,
                          )
                        }

                        return (
                          <SelectInput
                            path={`orderItems.${idx}.seat`}
                            options={[{ label: 'Select...', value: '' }, ...seatOptions]}
                            value={field.value ?? ''}
                            onChange={(option) =>
                              field.onChange(
                                Array.isArray(option)
                                  ? (option[0]?.value ?? '')
                                  : (option?.value ?? ''),
                              )
                            }
                            name={field.name}
                          />
                        )
                      }}
                    />
                    {errors.orderItems?.[idx]?.seat && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {errors.orderItems?.[idx]?.seat?.message}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 100, textAlign: 'right' }}>
                    <TextInput
                      path={`orderItems.${idx}.price`}
                      value={
                        orderItems[idx]?.price !== undefined ? String(orderItems[idx]?.price) : ''
                      }
                      readOnly
                      style={{ width: 80, textAlign: 'right', background: 'white', color: 'black' }}
                    />
                  </div>
                  <div style={{ width: 40, textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        remove(idx)
                      }}
                      disabled={fields.length === 1}
                      aria-label="Remove seat"
                      style={{ cursor: fields.length > 1 ? 'pointer' : 'not-allowed' }}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Button
                buttonStyle="secondary"
                icon="plus"
                onClick={(e) => {
                  e.preventDefault()
                  append({ ticketPriceId: '', seat: '', price: 0 })
                }}
                aria-label="Add seat"
              >
                Add Seat
              </Button>
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: 24 }}>
            <legend>Customer Info</legend>
            <div style={{ marginBottom: 8 }}>
              <label>First Name *</label>
              <br />
              <Controller
                control={control}
                name="firstName"
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextInput path="firstName" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.firstName && <div style={{ color: 'red' }}>{errors.firstName.message}</div>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Last Name *</label>
              <br />
              <Controller
                control={control}
                name="lastName"
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextInput path="lastName" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.lastName && <div style={{ color: 'red' }}>{errors.lastName.message}</div>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Email *</label>
              <br />
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextInput path="email" value={field.value ?? ''} onChange={field.onChange} />
                )}
              />
              {errors.email && <div style={{ color: 'red' }}>{errors.email.message}</div>}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label>Phone Number *</label>
              <br />
              <Controller
                control={control}
                name="phoneNumber"
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <TextInput
                    path="phoneNumber"
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.phoneNumber && (
                <div style={{ color: 'red' }}>{errors.phoneNumber.message}</div>
              )}
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: 24, padding: 0 }}>
            <legend>Order Summary</legend>

            <div
              style={{
                margin: '0 auto',
                borderRadius: 8,
                padding: 20,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <SelectOrderCategory path="category" isSubmitSuccessful={isSubmitSuccessful} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ flex: 1 }}>Order Note</div>
                <Controller
                  control={control}
                  name="note"
                  render={({ field }) => (
                    <TextareaInput
                      path="note"
                      value={field.value !== undefined ? String(field.value) : ''}
                      onChange={field.onChange}
                      style={{ textAlign: 'left', background: 'white', color: 'black' }}
                    />
                  )}
                />
              </div>
              {/* PromotionListCheckbox */}
              <div style={{ marginBottom: 16 }}>
                <PromotionListCheckbox
                  promotions={promotions}
                  selectedPromotions={selectedPromotions}
                  onSelectPromotions={setSelectedPromotions}
                  isAllowApplyMultiplePromotions={isAllowApplyMultiplePromotions as boolean}
                  maxAppliedPromotions={maxAppliedPromotions}
                  ticketSelected={ticketSelected}
                  event={selectedEvent as Event}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ flex: 1 }}>Total Before Discount</div>
                <TextInput
                  path="totalBeforeDiscount"
                  value={String(formatMoney(calculateTotal.amountBeforeDiscount))}
                  readOnly
                  style={{ textAlign: 'right', background: 'white', color: 'black' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ flex: 1 }}>Total Amount</div>
                <TextInput
                  path="computedTotal"
                  value={String(formatMoney(calculateTotal.amount))}
                  readOnly
                  style={{ textAlign: 'right', background: 'white', color: 'black' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ flex: 1 }}>Edit Total Amount</div>
                <Controller
                  control={control}
                  name="adjustedTotal"
                  rules={{
                    validate: (value) => {
                      const num = Number(value)
                      if (value === undefined || String(value) === '') return true
                      if (!isNaN(num) && num >= 0) return true
                      return 'Amount must be a non-negative number'
                    },
                  }}
                  render={({ field }) => (
                    <TextInput
                      path="adjustedTotal"
                      value={field.value !== undefined ? String(field.value) : ''}
                      onChange={field.onChange}
                      style={{ textAlign: 'right', background: 'white', color: 'black' }}
                    />
                  )}
                />
                {errors.adjustedTotal && (
                  <div style={{ color: 'red' }}>{errors.adjustedTotal.message}</div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
                <div style={{ flex: 1, fontWeight: 700, fontSize: 18 }}>Final Total</div>
                <div style={{ fontWeight: 700, fontSize: 18, textAlign: 'right', minWidth: 120 }}>
                  {formatMoney(totalAmount)}
                </div>
              </div>
            </div>
          </fieldset>

          <Button type="submit" buttonStyle="primary" disabled={isSubmitting}>
            Create Order
          </Button>
        </form>
      </FormProvider>
    </Gutter>
  )
}

export default CreateOrderForm
