import Cookies from 'js-cookie'

// Set Cookie
export const setCookie = (key: string, value: string, days: number | Date) => {
  Cookies.set(key, value, { expires: days, path: '/' })
}

// Get Cookie
export const getCookie = (key: string): string | undefined => {
  return Cookies.get(key)
}

// Remove Cookie
export const removeCookie = (key: string) => {
  Cookies.remove(key)
}
