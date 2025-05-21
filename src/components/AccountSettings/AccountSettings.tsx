import { useForm, Controller } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import * as React from 'react'
import { useTranslate } from '@/providers/I18n/client'
import { User } from '@/payload-types'
interface AccountSettingsForm {
    name: string
    phone: string
    email: string
    dob: Date | null
    gender: 'male' | 'female' | 'other'
}

const defaultValues: AccountSettingsForm = {
    name: '',
    phone: '',
    email: '',
    dob: null,
    gender: 'other',
}

const AccountSettings = ({ userData }: { userData: User }) => {
    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<AccountSettingsForm>({
        defaultValues: {
            name: ((userData?.firstName || '') + ' ' + (userData?.lastName || '')).trim(),
            phone: userData?.phoneNumber || '',
            email: userData?.email || '',
            dob: null,
            gender: 'other',
        },
    })
    const { t } = useTranslate()

    const onSubmit = (data: AccountSettingsForm) => {
        // TODO: handle submit
        alert(JSON.stringify(data, null, 2))
    }

    const dob = watch('dob')

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto bg-gray-100 rounded-2xl p-8 mt-8">
            <div className="flex flex-col items-center mb-8">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src="" alt="avatar" />
                        <AvatarFallback>👤</AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2 cursor-pointer border-2 border-white">
                        <span role="img" aria-label="upload">📷</span>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
                <div className="mt-2 text-lg font-semibold text-black">{t('userprofile.accountSettings.infoHelper')}</div>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-black mb-1">{t('userprofile.accountSettings.fullName')}</label>
                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} placeholder={t('userprofile.accountSettings.enterFullName')} className="bg-gray-100 border-gray-300 text-black" />
                        )}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">{t('userprofile.accountSettings.phone')}</label>
                    <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-black text-sm">+84</span>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder={t('userprofile.accountSettings.enterPhone')} className="bg-gray-100 border-gray-300 text-black rounded-l-none" />
                            )}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">{t('userprofile.accountSettings.email')}</label>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input {...field} placeholder={t('userprofile.accountSettings.enterEmail')} className="bg-gray-100 border-gray-300 text-black" disabled />
                        )}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">{t('userprofile.accountSettings.dob')}</label>
                    <Controller
                        name="dob"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <Input
                                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                    onFocus={e => {
                                        e.target.type = 'date'
                                    }}
                                    onBlur={e => {
                                        e.target.type = 'text'
                                    }}
                                    onChange={e => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    placeholder={t('userprofile.accountSettings.enterDob')}
                                    className="bg-gray-100 border-gray-300 text-black"
                                    type="text"
                                />
                            </div>
                        )}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-black mb-1">{t('userprofile.accountSettings.gender')}</label>
                    <Controller
                        name="gender"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="bg-gray-100 border-gray-300 text-black">
                                    <SelectValue placeholder={t('userprofile.accountSettings.selectGender')} />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-100 border-gray-300 text-black">
                                    <SelectItem value="male">{t('userprofile.accountSettings.male')}</SelectItem>
                                    <SelectItem value="female">{t('userprofile.accountSettings.female')}</SelectItem>
                                    <SelectItem value="other">{t('userprofile.accountSettings.other')}</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>
            <Button type="submit" className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-semibold">{t('userprofile.accountSettings.submit')}</Button>
        </form>
    )
}

export default AccountSettings
