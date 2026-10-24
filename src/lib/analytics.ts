import { GOATCOUNTER } from '../config'

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string; title?: string; event?: boolean }) => void }
  }
}

export function track(event: string) {
  if (GOATCOUNTER) window.goatcounter?.count({ path: event, title: event, event: true })
}
