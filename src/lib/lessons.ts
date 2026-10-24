import type { Language } from '../i18n'

export const FORM_LESSONS = [
  ['private', 'lessons.private.title'],
  ['children', 'lessons.children.title'],
  ['group', 'lessons.group.title'],
  ['unsure', 'form.lessonUnsure'],
] as const
export type LessonId = (typeof FORM_LESSONS)[number][0]

export const FORM_LEVELS = [
  ['beginner', 'form.levelBeginner'],
  ['intermediate', 'form.levelIntermediate'],
  ['advanced', 'form.levelAdvanced'],
] as const
export type LevelId = (typeof FORM_LEVELS)[number][0]

export function selectLesson(id: LessonId) {
  const select = document.getElementById('f-lesson') as HTMLSelectElement | null
  if (select) select.value = id
}

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
  botcheck: string
  elapsed: number
  turnstile: string
}

export const MIN_FILL_TIME = 2500

export const CONTACT_LIMITS = { name: 80, email: 200, phone: 40, dates: 120, people: 120, message: 3000 } as const
