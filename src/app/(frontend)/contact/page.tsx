'use client'

import PageClient from "./page.client"
import React, { useState, useEffect } from "react"
import { FormBlock } from "@/blocks/Form/Component"

const ContactForm = () => {
  const [formData, setFormData] = useState<any>(null)
  const formTitle = "Contact"

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/forms?where[title][equals]=${encodeURIComponent(formTitle)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch form data')
        }
        const data = await response.json()
        console.log('Fetched form data:', data)
        if (data.docs && data.docs.length > 0) {
          setFormData(data.docs[0])
        } else {
          console.log('No forms found with title: ', formTitle)
          setFormData(null)
        }
      } catch (err: any) {
        console.error('Error fetching form data:', err)
      }
    }

    console.log('Fetching form data for formId:', formTitle)
    fetchFormData()
  }, [formTitle])

  if (!formData) {
    return (
      <div>
        <PageClient />
        <div> No form data available </div>
      </div>
    )
  }

  return (
    <div className="pt-16 pb-8">
      <PageClient />
      <FormBlock 
        id="1"
        enableIntro={false}
        form={formData}
        introContent={undefined}
      />
    </div>
  )
}

export default ContactForm