'use client'

import React, { useMemo } from 'react'
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
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { useEvents } from '@/app/(affiliate)/providers/Affiliate'
import { Plus } from 'lucide-react'

// Zod validation schema
const affiliateLinkSchema = z.object({
  utmParams: z.object({
    utm_source: z.string().max(100, 'UTM Source must not exceed 100 characters').optional(),
    utm_medium: z.string().max(100, 'UTM Medium must not exceed 100 characters').optional(),
    utm_campaign: z.string().max(100, 'UTM Campaign must not exceed 100 characters').optional(),
    utm_term: z.string().max(100, 'UTM Term must not exceed 100 characters').optional(),
    utm_content: z.string().max(100, 'UTM Content must not exceed 100 characters').optional(),
  }),
  event: z.string().nonempty('Event is required'),
  promotionCode: z.string().max(50, 'Promotion code must not exceed 50 characters').nonempty('Promotion code is required'),
})

type AffiliateLinkFormData = z.infer<typeof affiliateLinkSchema>

interface CreateAffiliateLinkRequest {
  targetLink: string
  utmParams: {
    source: string
    medium: string
    campaign: string
    term?: string
    content?: string
  }
  event?: number
  promotionCode?: string
}

interface CreateAffiliateLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAffiliateLinkDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAffiliateLinkDialogProps) {
  const { toast } = useToast()
  const { events } = useEvents()

  const eventOptions = useMemo(() => {
    return events.map((event) => ({
      value: event.id.toString(),
      label: event.title || 'Untitled Event',
      startDatetime: event.startDatetime,
    }))
  }, [events])

  // Initialize React Hook Form with Zod validation
  const form = useForm<AffiliateLinkFormData>({
    resolver: zodResolver(affiliateLinkSchema),
    defaultValues: {
      // affiliateCode: '',
      utmParams: {
        utm_source: '',
        utm_medium: 'affiliate',
        utm_campaign: '',
        utm_term: '',
        utm_content: '',
      },
      event: '',
      promotionCode: '',
    },
  })

  const { watch, formState } = form
  const watchedValues = watch()
  const { isSubmitting } = formState

  // Generate target link based on form data
  const generateTargetLink = () => {
    const params = new URLSearchParams()
    let url = '';

    if(typeof window !== 'undefined') {
      url = `${window.location.origin}`
    }

    url += '/events'

    if (watchedValues.event) {
      const selectedEvent = events.find((evt) => String(evt.id) === watchedValues.event)
      if (selectedEvent) {
        url += `/${selectedEvent.slug}`
      }
    }
    if (watchedValues.promotionCode) {
      params.append('apc', watchedValues.promotionCode)
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

  const onSubmit = async (data: AffiliateLinkFormData) => {
    try {
      const requestData: CreateAffiliateLinkRequest = {
        targetLink: generateTargetLink(),
        utmParams: {
          source: data.utmParams.utm_source || '',
          medium: data.utmParams.utm_medium || '',
          campaign: data.utmParams.utm_campaign || '',
          term: data.utmParams.utm_term || undefined,
          content: data.utmParams.utm_content || undefined,
        },
        event: Number(data.event),
        promotionCode: data.promotionCode,
      }

      const response = await fetch('/api/affiliate/link', {
        method: 'POST',
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
            const fieldName = detail.field as keyof AffiliateLinkFormData
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
            description: result.error || 'Failed to create affiliate link.',
            variant: 'destructive',
          })
        }
        return
      }

      toast({
        title: 'Affiliate Link Created',
        description: 'Your affiliate link has been generated successfully.',
      })

      // Reset form and close dialog
      form.reset()
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating affiliate link:', error)
      toast({
        title: 'Error',
        description: 'Failed to create affiliate link. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Affiliate Link
          </DialogTitle>
          <DialogDescription>
            Generate trackable affiliate links with UTM parameters for marketing campaigns
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Affiliate Code Section */}
            {/* <FormField
              control={form.control}
              name="affiliateCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliate Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., kol123, influencer456" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your unique affiliate identifier (e.g., kol123, influencer456)
                  </FormDescription>
                  <FormMessage className='text-red-600' />
                </FormItem>
              )}
            /> */}

            {/* todo should be get setting from admin */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Event (*)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={'Select an event'} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
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
                    <FormMessage className='text-red-600' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion Code (*)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SUMMER20, EARLYBIRD" {...field} />
                    </FormControl>
                    <FormMessage className='text-red-600' />
                  </FormItem>
                )}
              />
            </div>

            {/* UTM Parameters Section */}
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">UTM Tracking Parameters</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure UTM parameters for tracking your affiliate link performance
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="utmParams.utm_source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UTM Source (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., facebook, google, newsletter" {...field} />
                        </FormControl>
                        <FormMessage className='text-red-600' />
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
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            <SelectItem value="affiliate">Affiliate</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="cpc">CPC</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="referral">Referral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className='text-red-600' />
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
                          <Input placeholder="e.g., summer-promo, holiday-sale" {...field} />
                        </FormControl>
                        <FormMessage className='text-red-600' />
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
                          <Input placeholder="e.g., classical music, orchestra" {...field} />
                        </FormControl>
                        <FormMessage className='text-red-600' />
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
                          <Input placeholder="e.g., banner-top, text-link" {...field} />
                        </FormControl>
                        <FormMessage className='text-red-600' />
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} variant={'secondary'}>
                <Plus className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Generating...' : 'Generate Affiliate Link'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
