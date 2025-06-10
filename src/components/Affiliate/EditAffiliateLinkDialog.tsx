'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { useEvents } from '@/app/(affiliate)/providers/Affiliate'

// Zod validation schema for editing
const editAffiliateLinkSchema = z.object({
  affiliateCode: z
    .string()
    .min(3, 'Affiliate code must be at least 3 characters')
    .max(50, 'Affiliate code must not exceed 50 characters')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Affiliate code can only contain letters, numbers, underscores, and hyphens',
    ),
  utmParams: z.object({
    utm_source: z.string().max(100, 'UTM Source must not exceed 100 characters').optional(),
    utm_medium: z.string().max(100, 'UTM Medium must not exceed 100 characters').optional(),
    utm_campaign: z.string().max(100, 'UTM Campaign must not exceed 100 characters').optional(),
    utm_term: z.string().max(100, 'UTM Term must not exceed 100 characters').optional(),
    utm_content: z.string().max(100, 'UTM Content must not exceed 100 characters').optional(),
  }),
  event: z.string().optional(),
  promotionCode: z.string().max(50, 'Promotion code must not exceed 50 characters').optional(),
  status: z.enum(['active', 'disabled']),
})

type EditAffiliateLinkFormData = z.infer<typeof editAffiliateLinkSchema>

interface AffiliateLink {
  id: number
  affiliateCode: string
  promotionCode?: string | null
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  } | null
  targetLink?: string | null
  status: 'active' | 'disabled'
  event?: any
  createdAt: string
  updatedAt: string
}

interface EditAffiliateLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  link: AffiliateLink | null
  onSuccess: () => void
}

export function EditAffiliateLinkDialog({
  open,
  onOpenChange,
  link,
  onSuccess,
}: EditAffiliateLinkDialogProps) {
  const { toast } = useToast()
  const { events } = useEvents()

  const form = useForm<EditAffiliateLinkFormData>({
    resolver: zodResolver(editAffiliateLinkSchema),
    defaultValues: {
      affiliateCode: '',
      utmParams: {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_term: '',
        utm_content: '',
      },
      event: '',
      promotionCode: '',
      status: 'active',
    },
  })

  // Reset form when link changes
  useEffect(() => {
    if (link) {
      form.reset({
        affiliateCode: link.affiliateCode,
        utmParams: {
          utm_source: link.utmParams?.source || '',
          utm_medium: link.utmParams?.medium || '',
          utm_campaign: link.utmParams?.campaign || '',
          utm_term: link.utmParams?.term || '',
          utm_content: link.utmParams?.content || '',
        },
        event: link.event ? String(link.event.id || link.event) : '',
        promotionCode: link.promotionCode || '',
        status: link.status,
      })
    }
  }, [link, form])

  const { watch, formState } = form
  const watchedValues = watch()
  const { isSubmitting } = formState
  // Generate target link based on form data
  const generateTargetLink = () => {
    const params = new URLSearchParams()
    let url = ''

    if (typeof window !== 'undefined') {
      url = `${window.location.origin}`
    }

    url += '/events'

    if (watchedValues.event) {
      const selectedEvent = events.find((evt) => String(evt.id) === watchedValues.event)
      if (selectedEvent) {
        url += `/${selectedEvent.slug}`
      }
    }

    if (watchedValues.affiliateCode) {
      params.append('affiliate', watchedValues.affiliateCode)
    }
    if (watchedValues.promotionCode) {
      params.append('promo_code', watchedValues.promotionCode)
    }

    if (watchedValues.utmParams?.utm_source) {
      params.append('utm_source', watchedValues.utmParams.utm_source)
    }

    if (watchedValues.utmParams?.utm_medium) {
      params.append('utm_medium', watchedValues.utmParams.utm_medium)
    }
    if (watchedValues.utmParams?.utm_campaign) {
      params.append('utm_campaign', watchedValues.utmParams.utm_campaign)
    }
    if (watchedValues.utmParams?.utm_term) {
      params.append('utm_term', watchedValues.utmParams.utm_term)
    }
    if (watchedValues.utmParams?.utm_content) {
      params.append('utm_content', watchedValues.utmParams.utm_content)
    }

    return `${url}?${params.toString()}`
  }

  const onSubmit = async (data: EditAffiliateLinkFormData) => {
    if (!link) return

    try {
      const targetLink = generateTargetLink()

      const requestData = {
        affiliateCode: data.affiliateCode,
        targetLink,
        utmParams: {
          source: data.utmParams.utm_source || '',
          medium: data.utmParams.utm_medium || '',
          campaign: data.utmParams.utm_campaign || '',
          term: data.utmParams.utm_term || undefined,
          content: data.utmParams.utm_content || undefined,
        },
        event: data.event ? Number(data.event) : undefined,
        promotionCode: data.promotionCode || undefined,
        status: data.status,
      }

      const response = await fetch(`/api/affiliate/link/${link.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!result.success) {
        if (result.details) {
          // Handle validation errors from server
          result.details.forEach((detail: any) => {
            const fieldName = detail.field as keyof EditAffiliateLinkFormData
            form.setError(fieldName, {
              type: 'server',
              message: detail.message,
            })
          })

          toast({
            title: 'Validation Error',
            description: 'Please check the form for errors.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Error',
            description: result.error || 'Failed to update affiliate link.',
            variant: 'destructive',
          })
        }
        return
      }

      toast({
        title: 'Success',
        description: 'Affiliate link updated successfully.',
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating affiliate link:', error)
      toast({
        title: 'Error',
        description: 'Failed to update affiliate link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const eventOptions = events.map((event) => ({
    value: event.id.toString(),
    label: event.title || 'Untitled Event',
    startDatetime: event.startDatetime,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Affiliate Link</DialogTitle>
          <DialogDescription>
            Update your affiliate link details and UTM parameters
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="affiliateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., kol123, influencer456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Event (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="None">No specific event</SelectItem>
                        {eventOptions.map((event) => (
                          <SelectItem key={event.value} value={event.value}>
                            {event.label}
                            {event.startDatetime && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({new Date(event.startDatetime).toLocaleDateString()})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SUMMER20, EARLYBIRD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* UTM Parameters */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">UTM Tracking Parameters</h3>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="utmParams.utm_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Source (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., facebook, google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmParams.utm_medium"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Medium (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select medium" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="affiliate">Affiliate</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="cpc">CPC</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmParams.utm_campaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Campaign (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., summer-promo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <FormField
                    control={form.control}
                    name="utmParams.utm_term"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Term (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., classical music" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="utmParams.utm_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Content (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., banner-top" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Generated Target URL Preview */}
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Generated Target URL (Preview)</Label>
                <div className="rounded-sm bg-gray-200 p-2">
                  <code className="flex-1 text-sm break-all bg-muted text-muted-foreground cursor-not-allowed">
                    {generateTargetLink()}
                  </code>
                </div>
                <p className="text-xs text-muted-foreground">
                  This URL will be generated automatically based on your UTM parameters and
                  affiliate code
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant={'secondary'}>
                {isSubmitting ? 'Updating...' : 'Update Link'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
