import { SITE_URL as FINAL_SITE_URL } from './config'

export const SITE_URL: string = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || FINAL_SITE_URL

export const IS_FINAL_URL = SITE_URL === FINAL_SITE_URL

export const BASE = import.meta.env.BASE_URL

export const withBase = (path: string) => BASE + path.replace(/^\//, '')
