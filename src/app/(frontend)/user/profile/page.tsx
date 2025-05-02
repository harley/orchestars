'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { useAuth } from '@/providers/CheckIn/useAuth'
import router from 'next/router'
import { format, parse } from 'date-fns'
import { categories } from '@/components/EventDetail/data/seat-maps/categories'

interface Ticket {
    id: string
    attendeeName: string
    email: string
    event: any
    eventDate: string
    phoneNumber: string
    ticketCode: string
    seat: string
    status: string
    ticketPriceInfo?: any
    isCheckedIn?: boolean
    checkinRecord?: any
}

const PurchasedTickets: React.FC = () => {
    const { t } = useTranslate()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const { isHydrated, token } = useAuth()
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'processing' | 'cancelled'>('all')
    const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished'>('upcoming')

    function getZoneId(ticket: any): string {
        const ticketPriceId =
          ticket?.ticketPriceInfo?.ticketPriceId ||
          ticket?.ticketPriceInfo?.id
      
        const matched = ticket?.event?.ticketPrices?.find(
          (price: any) => price.id === ticketPriceId
        )
      
        return matched?.key || 'unknown'
      }

    const filteredTickets = useMemo(() => {

        return tickets.filter((ticket) => {
            const parsedDate = parse(ticket?.eventDate, 'dd/MM/yyyy', new Date())
            const now = new Date()
            const isFinished = parsedDate < now

            if (timeFilter === 'upcoming' && isFinished) return false
            if (timeFilter === 'finished' && !isFinished) return false

            if (statusFilter === 'all') return true
            if (statusFilter === 'success') return ticket.status === 'booked'
            if (statusFilter === 'processing') {
                return ticket.status === 'pending_payment' || ticket.status === 'hold'
            }
            if (statusFilter === 'cancelled') return ticket.status === 'cancelled'

            return true
        })
    }, [tickets, statusFilter, timeFilter])


    useEffect(() => {
        if (!isHydrated) return
        if (!token) {
            router.replace('/user')
            return
        }

        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/user/ticket', {
                    method: 'GET',
                    headers: {
                        Authorization: `JWT ${token}`,
                    },
                })

                if (!res.ok) throw new Error('Failed to fetch tickets')
                const data = await res.json()
                setTickets(data.tickets || [])
            } catch (error) {
                console.error('Error fetching tickets:', error)
            }
        }

        fetchTickets()
    }, [isHydrated, token, router])

    return (
        <div className="bg-white min-h-screen text-black font-sans p-6">
            <h1 className="text-2xl font-bold mb-4">{t('userprofile.title')}</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button className="btn-primary" onClick={() => setStatusFilter('all')}>{t('userprofile.all')}</button>
                <button className="btn-secondary" onClick={() => setStatusFilter('success')}>{t('userprofile.success')}</button>
                <button className="btn-secondary" onClick={() => setStatusFilter('processing')}>{t('userprofile.processing')}</button>
                <button className="btn-secondary" onClick={() => setStatusFilter('cancelled')}>{t('userprofile.cancelled')}</button>
            </div>

            {/* Timeline filter */}
            <div className="flex gap-6 text-sm font-medium mb-4">
                <button
                    className={`pb-1 border-b-2 ${timeFilter === 'upcoming' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent'}`}
                    onClick={() => setTimeFilter('upcoming')}
                >
                    {t('userprofile.upcoming')}
                </button>
                <button
                    className={`pb-1 border-b-2 ${timeFilter === 'finished' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent'}`}
                    onClick={() => setTimeFilter('finished')}
                >
                    {t('userprofile.finished')}
                </button>
            </div>

            {/* Ticket List */}
            {filteredTickets.map((ticket) => {
                const zoneId = getZoneId(ticket)
                const zone = categories.find(c => c.id === zoneId)
                const parsedDate = parse(ticket?.eventDate, 'dd/MM/yyyy', new Date())

                return (
                    <div
                        key={ticket.id}
                        className="flex  overflow-hidden shadow-md mb-4 border-l-8"
                        style={{
                            borderColor: zone?.color || '#333',
                        }}
                    >
                        {/* Date Block */}
                        <div
                            className="flex flex-col items-center rounded-r-lg justify-center px-4 py-3 text-white w-24"
                            style={{
                                backgroundColor: zone?.color || '#333',
                            }}
                        >
                            <div className="text-3xl font-bold">
                                {format(parsedDate, 'dd')}
                            </div>
                            <div className="uppercase text-sm">
                                {format(parsedDate, 'LLL', {
                                    locale: undefined,
                                })}
                            </div>
                            <div className="text-sm">
                                {format(parsedDate, 'yyyy')}
                            </div>
                        </div>

                        {/* Details Block */}
                        <div className="flex-1 bg-gray-100 rounded-l-lg px-4 py-3 ">
                            <h2 className="text-lg font-semibold mb-1">{ticket?.event?.title}</h2>

                            <div className="flex gap-2 items-center mb-2">
                                {ticket.status === 'booked' && (
                                    <span className="inline-block bg-green-600  text-xs px-2 py-1 rounded">
                                        {t('userprofile.statusSuccess')}
                                    </span>
                                )}
                                {ticket.status === 'pending_payment' && (
                                    <span className="inline-block bg-yellow-500  text-xs px-2 py-1 rounded">
                                        {t('userprofile.statusProcessing')}
                                    </span>
                                )}
                                {ticket.status === 'hold' && (
                                    <span className="inline-block bg-orange-500  text-xs px-2 py-1 rounded">
                                        {t('userprofile.statusHold')}
                                    </span>
                                )}
                                {ticket.status === 'cancelled' && (
                                    <span className="inline-block bg-red-600  text-xs px-2 py-1 rounded">
                                        {t('userprofile.statusCancelled')}
                                    </span>
                                )}

                            </div>

                            <p className="text-sm">
                                {t('userprofile.orderCode')}: <strong>{ticket.ticketCode}</strong>
                            </p>
                            <p className="text-sm"> {ticket.eventDate}</p>
                            <p className="text-sm">
                                {t('userprofile.seat')}: {ticket.seat || '—'}
                            </p>
                            <p className="text-sm">
                                {t('userprofile.ticketPrice')}: {ticket.ticketPriceInfo?.name || '—'}
                            </p>
                            <p className="text-sm"> {ticket.event?.eventLocation || t('userprofile.location')}</p>
                        </div>
                    </div>
                )
            })}

        </div>
    )
}

export default PurchasedTickets
