import { setCookie as set, getCookie as get, deleteCookie, getCookies, hasCookie } from 'cookies-next'
import { COOKIE_OPTIONS } from './rootURL'

// Define the type for the key and value parameters
export const setCookie = (key: string, value?: string) => {
  set(key, value || '', COOKIE_OPTIONS)
}

// Define the return type as string
export const getCookie = (key: string): string => {
  return get(key, COOKIE_OPTIONS) || ''
}

// Define the type for the key parameter
export const removeCookie = (key: string) => {
  deleteCookie(key, COOKIE_OPTIONS)
}

// No parameters, so no need for type annotations here
export const clearCookie = () => {
  for (const key in getCookies()) {
    removeCookie(key)
  }
}

// Define the return type as boolean
export const isCookie = (key: string): boolean => {
  return hasCookie(key, COOKIE_OPTIONS)
}