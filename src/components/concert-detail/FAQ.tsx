import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQ {
  question: string
  answer: string
}
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
const FAQ = () => {
  return (
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
  )
}

export default FAQ
