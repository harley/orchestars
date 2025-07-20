import { ERROR_CODES } from '@/config/error-code'
import { getLocale, t } from '@/providers/I18n/server'

export const handleNextErrorMsgResponse = async (error: any) => {
  // Get the error code and parameters from the error object
  const errorCode = error.errorCode || error.message

  // Check if this is already a user-facing translated message
  // These messages should be returned as-is without further processing
  if (typeof errorCode === 'string' && (
    errorCode.includes('This ticket is for') ||
    errorCode.includes('Vé này dành cho') ||
    errorCode.includes('already passed') ||
    errorCode.includes('đã kết thúc')
  )) {
    return errorCode
  }

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

  // Only return translatedMessage if it's different from the input (meaning translation was found)
  if (translatedMessage && translatedMessage !== `errorCode.${code}`) {
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
