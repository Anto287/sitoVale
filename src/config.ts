export const SITE_URL = 'https://www.vallyski.com'

export const CONTACT = {
  whatsapp: '393889397424',
  whatsappLabel: '+39 388 939 7424',
  email: 'bernardivale46@gmail.com',
  emailLabel: 'bernardivale46@gmail.com',
  instagram: 'https://instagram.com/vally.it',
  instagramLabel: 'vally.it',
  maps: 'https://maps.google.com/?q=Tarentaise+Savoie',
} as const

export const FIRST_SEASON = 2021

export function seasonsTaught(now = new Date()) {
  const season = now.getMonth() >= 10 ? now.getFullYear() : now.getFullYear() - 1
  return season - FIRST_SEASON + 1
}

export const MAIL = {
  from: 'prenotazioni@vallyski.com',
  siteName: 'Sito Vally Ski',
} as const

export const GOATCOUNTER = ''

export const LEGAL = {
  publisher: 'Valentina Bernardi',
  status: '',
  address: '',
  siret: '',
  vat: '',
  host: '',
} as const
