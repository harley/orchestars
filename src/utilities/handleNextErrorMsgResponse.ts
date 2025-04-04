import { ERROR_CODES } from '@/config/error-code'
import { getLocale, t } from '@/providers/I18n/server'

export const handleNextErrorMsgResponse = async (error: any) => {
  // Get the error code and parameters from the error object
  const errorCode = error.errorCode || error.message
  const [code, paramsString] = errorCode.split('|')

  // Parse parameters if they exist
  let params = {}
  if (paramsString) {
    try {
      params = JSON.parse(paramsString)
    } catch (e) {
      console.error('Error parsing error parameters:', e)
    }
  }

  // Get the current locale
  const locale = await getLocale()

  // Try to get the translated message for the error code
  const translatedMessage = t(`errorCode.${code}`, locale, params)

  if (translatedMessage) {
    return translatedMessage
  }

  // If no translation found, try to get the message from ERROR_CODES
  const messageError = ERROR_CODES[errorCode as keyof typeof ERROR_CODES]
  if (messageError) {
    return messageError
  }

  // If no error code match, return the default error message
  return error?.message || t('errorCode.SYS001', locale)
}
