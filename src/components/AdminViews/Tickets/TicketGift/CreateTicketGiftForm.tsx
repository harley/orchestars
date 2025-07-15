'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, TextInput, SelectInput, CheckboxInput, Gutter, toast } from '@payloadcms/ui'
import qs from 'qs'

// Option type for Payload SelectInput
interface Option {
  label: string
  value: string
}

// Types for API responses
interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
}

interface Ticket {
  id: number
  ticketCode: string
  seat?: string
  attendeeName?: string
  status: string
  eventDate?: string
  event?: {
    id: number
    title: string
    eventDate?: string
  }
  ticketPriceName?: string
  createdAt: string
}

// Validation schema using zod
const schema = z.object({
  ownerId: z.string().min(1, 'Ticket owner is required'),
  ticketIds: z.array(z.number()).min(1, 'Select at least one ticket'),
  recipientFirstName: z.string().min(1, 'First name is required'),
  recipientLastName: z.string().min(1, 'Last name is required'),
  recipientEmail: z.string().min(1, 'Email is required').email('Invalid email'),
  recipientPhone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const CreateTicketGiftForm: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedOwner, setSelectedOwner] = useState<string>('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  // Add state for ticket search
  const [ticketSearch, setTicketSearch] = useState('')

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerId: '',
      ticketIds: [],
      recipientFirstName: '',
      recipientLastName: '',
      recipientEmail: '',
      recipientPhone: '',
    },
  })

  // Fetch users from API using PayloadCMS endpoint
  const fetchUsers = useCallback(async (search = '') => {
    setLoadingUsers(true)
    try {
      let url =
        '/api/users?depth=0&limit=50&select[email]=true&select[firstName]=true&select[lastName]=true&select[id]=true'

      if (search) {
        // Use PayloadCMS where clause for email search
        url += `&where[email][like]=${encodeURIComponent(search)}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.docs || [])
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  // Fetch tickets for selected owner using PayloadCMS API
  const fetchTickets = useCallback(async (userId: string) => {
    if (!userId) {
      setTickets([])
      return
    }

    setLoadingTickets(true)
    try {
      // Use PayloadCMS tickets API with filters
      const queryObject = {
        depth: 1,
        limit: 0, // fetch all tickets without pagination
        where: {
          user: { equals: userId },
          status: { equals: 'booked' },
          'giftInfo.isGifted': { equals: false },
        },
        select: {
          id: true,
          ticketCode: true,
          seat: true,
          attendeeName: true,
          ticketPriceName: true,
          event: true,
          eventDate: true,
          createdAt: true,
          status: true,
          eventScheduleId: true,
        },
      }

      const queryString = qs.stringify(queryObject, { encode: true, arrayFormat: 'brackets' })

      console.log('queryString', queryString)

      const url = `/api/tickets?${queryString}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.docs || [])
      } else {
        toast.error('Failed to fetch tickets')
        setTickets([])
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      toast.error('Failed to fetch tickets')
      setTickets([])
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchTerm: string) => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }

      const timeout = setTimeout(() => {
        fetchUsers(searchTerm)
      }, 300) // 300ms delay

      setSearchTimeout(timeout)
    },
    [searchTimeout, fetchUsers],
  )

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Fetch tickets when owner changes
  useEffect(() => {
    fetchTickets(selectedOwner)
    // Reset ticketIds when owner changes
    setValue('ticketIds', [])
  }, [selectedOwner, setValue, fetchTickets])

  // Type guard for Option
  function isOption(obj: any): obj is Option {
    return obj && typeof obj === 'object' && 'value' in obj
  }

  const onSubmit = async (data: FormValues) => {
    console.log('data', data)

    try {
      const response = await fetch('/api/tickets/gift-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerId: parseInt(data.ownerId),
          ticketIds: data.ticketIds,
          recipientFirstName: data.recipientFirstName,
          recipientLastName: data.recipientLastName,
          recipientEmail: data.recipientEmail,
          recipientPhone: data.recipientPhone,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          `Tickets gifted successfully! ${result.data.isNewUser ? 'New user account created for recipient.' : 'Tickets transferred to existing user.'}`,
        )
        reset()
        setSelectedOwner('')
        setTickets([])
      } else {
        toast.error(result.message || 'Failed to gift tickets')
      }
    } catch (error) {
      console.error('Error gifting tickets:', error)
      toast.error('Failed to gift tickets')
    }
  }

  const filteredTickets = useMemo(() => {
    const search = ticketSearch.trim().toLowerCase()
    return tickets.filter((ticket) => {
      if (!search) return true
      return (
        ticket.ticketCode?.toLowerCase().includes(search) ||
        ticket.seat?.toLowerCase().includes(search)
      )
    })
  }, [tickets, ticketSearch])

  return (
    <Gutter>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
          Gift Tickets to Another User
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Ticket Owner Section */}
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>
              1. Select Ticket Owner (Only ticket owner who bought tickets can gift)
            </h3>
            {/* Using Controller for better form control with PayloadCMS SelectInput */}
            <Controller
              name="ownerId"
              control={control}
              render={({ field }) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <SelectInput
                    label="Ticket Owner"
                    name="ownerId"
                    path="ownerId"
                    value={field.value}
                    options={users.map((user) => ({
                      label: `${user.email}${user.firstName && user.lastName ? ` (${user.firstName} ${user.lastName})` : ''}`,
                      value: user.id.toString(),
                    }))}
                    onChange={(option) => {
                      // Payload SelectInput returns Option or Option[]
                      if (isOption(option)) {
                        field.onChange(option.value)
                        setSelectedOwner(option.value)
                      } else if (
                        Array.isArray(option) &&
                        option.length > 0 &&
                        isOption(option[0])
                      ) {
                        field.onChange(option[0].value)
                        setSelectedOwner(option[0].value)
                      } else {
                        field.onChange('')
                        setSelectedOwner('')
                      }
                    }}
                    onInputChange={(inputValue) => {
                      // Use debounced search to avoid too many API calls
                      if (inputValue && inputValue.length > 2) {
                        debouncedSearch(inputValue)
                      } else if (!inputValue) {
                        fetchUsers()
                      }
                    }}
                    required
                    placeholder={loadingUsers ? 'Loading users...' : 'Search by email...'}
                    isClearable
                  />
                  {errors.ownerId?.message && (
                    <div style={{ color: 'red', fontSize: 12 }}>{errors.ownerId?.message}</div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Ticket Selection Section */}

          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>2. Select Ticket(s) to Gift</h3>
            {selectedOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Quick search input for ticket code or seat */}
                <TextInput
                  label="Quick Search Ticket Code or Seat"
                  placeholder="Type ticket code or seat..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  style={{ marginBottom: '12px', maxWidth: 300 }}
                  path="ticketSearch"
                />
                {loadingTickets && (
                  <div style={{ color: '#666', fontStyle: 'italic' }}>Loading tickets...</div>
                )}
                {!loadingTickets && tickets.length === 0 && (
                  <div style={{ color: '#666' }}>No giftable tickets found for this user.</div>
                )}
                {/* Filter tickets based on search term */}
                {/** Filtered tickets array **/}
                <Controller
                  name="ticketIds"
                  control={control}
                  render={({ field }) => (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '16px',
                      }}
                    >
                      {!loadingTickets &&
                        filteredTickets.map((ticket) => (
                          <CheckboxInput
                            key={ticket.id}
                            label={`${ticket.ticketCode}${ticket.seat ? ` - Seat ${ticket.seat}` : ''} - ${ticket.eventDate || ''} - ${ticket.event?.title || 'Unknown Event'}${ticket.ticketPriceName ? ` (${ticket.ticketPriceName})` : ''}`}
                            name="ticketIds"
                            checked={field.value.includes(ticket.id)}
                            onToggle={(event) => {
                              const checked = event.target.checked
                              let newValue = [...field.value]
                              if (checked) {
                                newValue.push(ticket.id)
                              } else {
                                newValue = newValue.filter((id) => id !== ticket.id)
                              }
                              field.onChange(newValue)
                            }}
                          />
                        ))}
                    </div>
                  )}
                />

                {errors.ticketIds?.message && (
                  <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '4px' }}>
                    {errors.ticketIds.message}
                  </div>
                )}
              </div>
            ) : (
              <div>Please select a ticket owner first.</div>
            )}
          </div>

          {/* Recipient Information Section */}
          <div>
            <h3 style={{ fontWeight: '600', marginBottom: '12px' }}>3. Recipient Information</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
              }}
            >
              <Controller
                name="recipientFirstName"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextInput
                      label="First Name"
                      placeholder="First Name"
                      path="recipientFirstName"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                    {errors.recipientFirstName?.message && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {errors.recipientFirstName?.message}
                      </div>
                    )}
                  </div>
                )}
              />
              <Controller
                name="recipientLastName"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextInput
                      label="Last Name"
                      placeholder="Last Name"
                      path="recipientLastName"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                    {errors.recipientLastName?.message && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {errors.recipientLastName?.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              <Controller
                name="recipientEmail"
                control={control}
                render={({ field }) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <TextInput
                      label="Email"
                      placeholder="Email"
                      path="recipientEmail"
                      value={field.value}
                      onChange={field.onChange}
                      required
                    />
                    {errors.recipientEmail?.message && (
                      <div style={{ color: 'red', fontSize: 12 }}>
                        {errors.recipientEmail?.message}
                      </div>
                    )}
                  </div>
                )}
              />
              <Controller
                name="recipientPhone"
                control={control}
                render={({ field }) => (
                  <TextInput
                    label="Phone Number"
                    placeholder="Phone Number (optional)"
                    path="recipientPhone"
                    value={field.value}
                    onChange={field.onChange}
                    Error={errors.recipientPhone?.message}
                  />
                )}
              />
            </div>
          </div>

          <div style={{ width: '100%', marginTop: '16px' }}>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedOwner || (watch('ticketIds') || []).length === 0}
            >
              {isSubmitting ? 'Sending Gift...' : 'Send Gift'}
            </Button>
          </div>
        </form>
      </div>
    </Gutter>
  )
}

export default CreateTicketGiftForm
