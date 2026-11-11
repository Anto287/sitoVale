import { LEGAL } from '../src/config.ts'

const required = {
  publisher: 'titolare',
  status: 'forma giuridica',
  address: 'indirizzo professionale',
  siret: 'SIRET',
  host: 'hébergeur',
  mediator: 'mediatore dei consumatori',
}
const missing = Object.entries(required)
  .filter(([field]) => !LEGAL[field].trim())
  .map(([, label]) => label)

if (missing.length) {
  console.error(`Build di produzione bloccata. Completare in src/config.ts: ${missing.join(', ')}.`)
  process.exitCode = 1
}
