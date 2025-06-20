'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { useTranslate } from '@/providers/I18n/client'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: SerializedEditorState
}

function lexicalToPlainText(lexicalState: any): string {
  if (!lexicalState?.root?.children) return ''

  return lexicalState.root.children
    .map((node: any) => {
      if (node.type === 'paragraph' && node.children) {
        return node.children
          .filter((child: any) => child.type === 'text')
          .map((child: any) => child.text || '')
          .join('')
      }
      return ''
    })
    .filter(Boolean)
    .join('\n') // Join paragraphs with newlines
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = formMethods

  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const router = useRouter()
  const { t } = useTranslate()

  const { toast } = useToast()

  const onSubmit = useCallback(
    async (data: FormFieldBlock[]) => {
      const submissionData = Object.entries(data).map(([name, value]) => ({
        field: name,
        value,
      }))

      try {
        const res = await fetch(`${getClientSideURL()}/api/form-submissions`, {
          body: JSON.stringify({
            form: formID,
            submissionData,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })

        const resData = await res.json()

        if (res.ok) {
          setHasSubmitted(true)
          reset()
          toast({
            title: t('message.success'),
            description:
              lexicalToPlainText(confirmationMessage) || t('message.thankYouForYourSubmission'),
          })

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }

          return
        }

        toast({
          title: t('message.failed'),
          description: resData.errors?.[0]?.message || t('message.failedMessage'),
          variant: 'destructive',
        })
      } catch (err) {
        console.error(err)

        toast({
          title: t('message.failed'),
          description: t('message.failedMessage'),
          variant: 'destructive',
        })
      }
    },
    [router, formID, redirect, confirmationType, t, toast, confirmationMessage, reset],
  )

  return (
    <div className="container lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
      )}
      <div className="p-4 lg:p-6 border border-border rounded-[0.8rem]">
        <FormProvider {...formMethods}>
          <form id={formID} onSubmit={handleSubmit(onSubmit)}>
            {/* display title */}
            {formFromProps.title && (
              <h2 className="text-2xl font-bold mb-8 text-center">{formFromProps.title}</h2>
            )}
            <div className="mb-4 last:mb-0">
              {formFromProps &&
                formFromProps.fields &&
                formFromProps.fields?.map((field, index) => {
                  const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                  if (Field) {
                    return (
                      <div className="mb-6 last:mb-0" key={index}>
                        <Field
                          form={formFromProps}
                          {...field}
                          {...formMethods}
                          control={control}
                          errors={errors}
                          register={register}
                        />
                      </div>
                    )
                  }
                  return null
                })}
            </div>

            <Button form={formID} type="submit" variant="default" className="border px-8" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2" />
                  {t('message.submitting')}
                </span>
              ) : (
                submitButtonLabel || t('message.submit')
              )}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
