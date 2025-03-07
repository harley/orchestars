'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import SeatMap, { SeatType } from '@/components/concert-detail/SeatMap'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users } from 'lucide-react'
import CustomButton from '@/components/ui/custom-button'

interface TicketOption {
  id: string
  name: string
  price: number
  quantity: number
}

interface Performer {
  id: number
  name: string
  image: string
  genre: string
}

interface ScheduleItem {
  time: string
  title: string
  description: string
  day?: string
}

interface FAQ {
  question: string
  answer: string
}

const TicketDetails = () => {
  const router = useRouter()

  const [ticketOptions, setTicketOptions] = useState<TicketOption[]>([
    { id: 'general', name: 'General Admission', price: 89, quantity: 0 },
    { id: 'vip', name: 'VIP Experience', price: 149, quantity: 0 },
    { id: 'student', name: 'Student Discount', price: 49, quantity: 0 },
  ])

  const [selectedSeats, setSelectedSeats] = useState<
    {
      id: string
      type: SeatType
      row: string
      number: number
      price: number
    }[]
  >([])

  const handleSeatSelect = (
    seats: {
      id: string
      type: SeatType
      row: string
      number: number
      price: number
    }[],
  ) => {
    setSelectedSeats(seats)
  }

  const performers: Performer[] = [
    {
      id: 1,
      name: 'Maya Rivers',
      image: '/placeholder.svg',
      genre: 'Pop/R&B',
    },
    {
      id: 2,
      name: 'Electric Pulse',
      image: '/placeholder.svg',
      genre: 'Electronic',
    },
    {
      id: 3,
      name: 'The Resonants',
      image: '/placeholder.svg',
      genre: 'Alternative Rock',
    },
    {
      id: 4,
      name: 'DJ Harmony',
      image: '/placeholder.svg',
      genre: 'EDM',
    },
  ]

  const schedule: ScheduleItem[] = [
    {
      day: 'Day 1',
      time: '5:00 PM',
      title: 'Doors Open',
      description: 'Early entry for VIP ticket holders',
    },
    {
      day: 'Day 1',
      time: '6:30 PM',
      title: 'Opening Act: The Resonants',
      description: '45-minute set featuring new material',
    },
    {
      day: 'Day 1',
      time: '8:00 PM',
      title: 'Main Performance: Maya Rivers',
      description: '90-minute headline performance',
    },
    {
      day: 'Day 2',
      time: '4:30 PM',
      title: 'Doors Open',
      description: 'General admission',
    },
    {
      day: 'Day 2',
      time: '6:00 PM',
      title: 'DJ Harmony Set',
      description: 'Electronic music showcase',
    },
    {
      day: 'Day 2',
      time: '7:30 PM',
      title: 'Electric Pulse Performance',
      description: 'Featuring special guest collaborations',
    },
  ]

  const faqs: FAQ[] = [
    {
      question: 'What items are prohibited at the venue?',
      answer:
        'Outside food and drinks, professional cameras, weapons, illegal substances, and large bags are prohibited. Small purses and clear bags are allowed.',
    },
    {
      question: 'Is there parking available at the venue?',
      answer:
        'Yes, paid parking is available at the venue for $20 per vehicle. We recommend carpooling or using public transportation as parking spaces are limited.',
    },
    {
      question: 'What time should I arrive?',
      answer:
        'We recommend arriving at least 1 hour before the scheduled performance time to allow for security checks and to find your seats.',
    },
    {
      question: 'Are tickets refundable?',
      answer:
        'Tickets are non-refundable, but can be transferred to another person up to 48 hours before the event. Please contact customer service for assistance with transfers.',
    },
    {
      question: 'Is there an age restriction for the concert?',
      answer:
        'The concert is open to all ages. However, attendees under 16 must be accompanied by an adult.',
    },
  ]

  const calculateTotal = () => {
    const ticketsTotal = ticketOptions.reduce((sum, option) => {
      return sum + option.price * option.quantity
    }, 0)

    const seatsTotal = selectedSeats.reduce((sum, seat) => {
      return sum + seat.price
    }, 0)

    return ticketsTotal + seatsTotal
  }

  const handleQuantityChange = (id: string, quantity: number) => {
    setTicketOptions((prevOptions) =>
      prevOptions.map((option) => (option.id === id ? { ...option, quantity } : option)),
    )
  }

  const handleBuyTickets = () => {
    const total = calculateTotal()
    if (total === 0) {
      toast.error('Please select at least one ticket or seat')
      return
    }

    router.push('/payment')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="relative h-[500px] md:h-[600px] overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=1800&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>

          <div className="relative z-20 h-full flex items-end">
            <div className="container mx-auto px-6 md:px-10 pb-16 md:pb-20 w-full">
              <div className="max-w-3xl">
                <div className="inline-block px-3 py-1 mb-3 border border-white/30 rounded-full backdrop-blur text-xs text-white/90">
                  Powered by <span className="font-semibold">MelodySale</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 animate-fade-in">
                  Summer Music Festival 2023
                </h1>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-white/90 mb-8">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Aug 15-16, 2023 • 5:00 PM</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>Central Park Amphitheater</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span>5,000+ attendees</span>
                  </div>
                </div>

                <CustomButton
                  variant="interested"
                  size="lg"
                  className="shadow-lg"
                  onClick={handleBuyTickets}
                >
                  Get Tickets
                </CustomButton>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <SeatMap onSeatSelect={handleSeatSelect} />
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Ticket Options</h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                {ticketOptions.map((option) => (
                  <div key={option.id} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{option.name}</h3>
                        <p className="text-gray-600">${option.price.toFixed(2)}</p>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          value={option.quantity}
                          onChange={(e) =>
                            handleQuantityChange(option.id, parseInt(e.target.value) || 0)
                          }
                          className="w-full text-center"
                        />
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Your Selection</h3>

                {ticketOptions
                  .filter((option) => option.quantity > 0)
                  .map((option) => (
                    <div key={option.id} className="flex justify-between mb-2">
                      <span>
                        {option.quantity}x {option.name}
                      </span>
                      <span>${(option.price * option.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                {selectedSeats.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="font-medium mb-2">Selected Seats:</h4>
                    {selectedSeats.map((seat) => (
                      <div key={seat.id} className="flex justify-between mb-2">
                        <span>
                          Seat {seat.row}
                          {seat.number} ({seat.type})
                        </span>
                        <span>${seat.price}</span>
                      </div>
                    ))}
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>

                <Button
                  onClick={handleBuyTickets}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Complete Purchase
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Performers</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {performers.map((performer) => (
                <div
                  key={performer.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={performer.image}
                      alt={performer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{performer.name}</h3>
                    <p className="text-gray-600">{performer.genre}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Event Schedule</h2>

            <div className="max-w-3xl mx-auto">
              {['Day 1', 'Day 2'].map((day) => (
                <div key={day} className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-purple-700">{day}</h3>

                  {schedule
                    .filter((item) => item.day === day)
                    .map((item, index) => (
                      <div
                        key={index}
                        className="flex mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                      >
                        <div className="w-24 flex-shrink-0 font-bold text-purple-600">
                          {item.time}
                        </div>
                        <div className="border-l-2 border-purple-300 pl-4 ml-4">
                          <h4 className="font-bold text-lg group-hover:text-purple-700 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default TicketDetails
