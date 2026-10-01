import type { Language } from '../i18n'

/** Tipi di lezione nel modulo contatti: valore del campo e testo mostrato. */
export const FORM_LESSONS = [
  ['private', 'lessons.private.title'],
  ['children', 'lessons.children.title'],
  ['group', 'lessons.group.title'],
  ['unsure', 'form.lessonUnsure'],
] as const
export type LessonId = (typeof FORM_LESSONS)[number][0]

/** Livelli nel modulo contatti: valore del campo e testo mostrato. */
export const FORM_LEVELS = [
  ['beginner', 'form.levelBeginner'],
  ['intermediate', 'form.levelIntermediate'],
  ['advanced', 'form.levelAdvanced'],
] as const
export type LevelId = (typeof FORM_LEVELS)[number][0]

/** Dalle card delle lezioni: il modulo arriva con la lezione già scelta. */
export function selectLesson(id: LessonId) {
  const select = document.getElementById('f-lesson') as HTMLSelectElement | null
  if (select) select.value = id
}

/**
 * Richiesta inviata dal modulo a functions/api/contact.ts (Cloudflare), che la spedisce per email.
 * Usata da entrambe le parti, così sito e funzione non possono andare fuori sincrono.
 */
export type ContactRequest = {
  lang: Language
  name: string
  email: string
  phone: string
  lesson: LessonId
  level: LevelId
  dates: string
  people: string
  message: string
  /** campo trappola: lo compilano solo i bot */
  botcheck: string
}

/** Lunghezza massima di ogni campo (controllata anche dalla funzione). */
export const CONTACT_LIMITS = { name: 80, email: 200, phone: 40, dates: 120, people: 120, message: 3000 } as const
