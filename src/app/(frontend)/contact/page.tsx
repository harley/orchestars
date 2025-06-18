'use client'

import PageClient from "./page.client"
import React, { useState, useEffect } from "react"
import { FormBlock } from "@/blocks/Form/Component"
import type { Form as FormType } from "@payloadcms/plugin-form-builder/types"

const ContactForm = () => {
  const [formData, setFormData] = useState<FormType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/forms?where[title][equals]=${encodeURIComponent("Contact")}`)
        if (!response.ok) {
          throw new Error('Failed to fetch form data')
        }
        const data = await response.json()
        const doc = (data?.docs || []).length > 0 ? data.docs[0] : null;
        setFormData(doc);
      } catch (err: any) {
        console.error('Error fetching form data:', err)
        setError('An error occurred while fetching form data. Please try again later.')
      }
    }

    fetchFormData()
  }, [])

  if (error) {
    return (
      <div>
        <PageClient />
        <div>{error}</div>
      </div>
    )
  }

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
        enableIntro={false}
        form={formData}
        introContent={undefined}
      />
    </div>
  )
}

export default ContactForm