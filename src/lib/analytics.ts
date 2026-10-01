import { GOATCOUNTER } from '../config'

declare global {
  interface Window {
    goatcounter?: { count: (vars: { path: string; title?: string; event?: boolean }) => void }
  }
}

/**
 * Evento per le statistiche (GoatCounter, senza cookie): tocchi su WhatsApp, email, modulo inviato.
 * Senza GOATCOUNTER in config.ts lo script non viene caricato e qui non succede nulla.
 */
export function track(event: string) {
  if (GOATCOUNTER) window.goatcounter?.count({ path: event, title: event, event: true })
}
