import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from '@/components/ui/select'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
// import { format } from 'date-fns'
import * as React from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { User } from '@/payload-types'
import { toast } from '@/components/ui/use-toast'

interface AccountSettingsForm {
  firstName: string
  lastName: string
  phone: string
  email: string
  dob: Date | null
  gender: 'male' | 'female' | 'other'
}

const AccountSettings = ({ userData, className }: { userData: User; className?: string }) => {
  const {
    control,
    handleSubmit,
    // formState: { isSubmitting },
    reset,
  } = useForm<AccountSettingsForm>({
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      phone: userData?.phoneNumber || '',
      email: userData?.email || '',
      dob: null,
      gender: 'other',
    },
  })
  const { t } = useTranslate()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: AccountSettingsForm) => {
    try {
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1200))
      toast({
        variant: 'success',
        title: t('userprofile.accountSettings.successTitle') || 'Profile updated!',
        description:
          t('userprofile.accountSettings.successDesc') ||
          'Your profile information has been saved.',
      })
      reset(data)
    } catch (_err) {
      toast({
        variant: 'destructive',
        title: t('userprofile.accountSettings.errorTitle') || 'Update failed',
        description:
          t('userprofile.accountSettings.errorDesc') || 'There was a problem saving your profile.',
      })
    }
  }

  const containerClass = `max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className || ''}`

  return (
    <div className={containerClass}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold my-4">{t('userprofile.userProfile')}</h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`mx-auto rounded-md  p-8 mt-8 `}
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-blue-200 shadow-md">
                <AvatarImage src="" alt="avatar" />
                <AvatarFallback className="text-[50px]">👤</AvatarFallback>
              </Avatar>
              {/* <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer border-2 border-white"
            >
              <span role="img" aria-label="upload">
                📷
              </span>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
            </label> */}
            </div>
            <div className="mt-4 text-lg font-semibold text-gray-900 text-center">
              {t('userprofile.accountSettings.infoHelper')}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.firstName')}
              </label>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    placeholder={t('common.enterFirstName')}
                    className="bg-gray-50 border-gray-300 text-black focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('common.lastName')}
              </label>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    placeholder={t('common.enterLastName')}
                    className="bg-gray-50 border-gray-300 text-black focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('userprofile.accountSettings.phone')}
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-50 text-black text-sm">
                  +84
                </span>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled
                      placeholder={t('userprofile.accountSettings.enterPhone')}
                      className="bg-gray-50 border-gray-300 text-black rounded-l-none focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm"
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('userprofile.accountSettings.email')}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    placeholder={t('userprofile.accountSettings.enterEmail')}
                    className="bg-gray-50 border-gray-300 text-black focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm"
                  />
                )}
              />
            </div>
            {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userprofile.accountSettings.dob')}
            </label>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <div>
                  <Input
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onFocus={(e) => {
                      e.target.type = 'date'
                    }}
                    onBlur={(e) => {
                      e.target.type = 'text'
                    }}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    placeholder={t('userprofile.accountSettings.enterDob')}
                    className="bg-gray-50 border-gray-300 text-black focus:bg-white focus:border-blue-400 transition-all duration-200 shadow-sm"
                    type="text"
                  />
                </div>
              )}
            />
          </div> */}
            {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('userprofile.accountSettings.gender')}
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="bg-gray-50 border-gray-300 text-black">
                    <SelectValue placeholder={t('userprofile.accountSettings.selectGender')} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 border-gray-300 text-black">
                    <SelectItem value="male">{t('userprofile.accountSettings.male')}</SelectItem>
                    <SelectItem value="female">{t('userprofile.accountSettings.female')}</SelectItem>
                    <SelectItem value="other">{t('userprofile.accountSettings.other')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div> */}
          </div>
          {/* <Button
          type="submit"
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all duration-200 shadow-md flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
          )}
          {t('userprofile.accountSettings.submit') || 'Save Changes'}
        </Button> */}
        </form>
      </div>
    </div>
  )
}

export default AccountSettings
