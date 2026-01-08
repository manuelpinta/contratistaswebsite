// Configuración de países y sus requisitos

export type CountryCode = 'MX' | 'HN' | 'SV' | 'BZ'
export type CityCode = 
  | 'MX_COATZACOALCOS' 
  | 'MX_MINATITLAN' 
  | 'MX_AGUASCALIENTES' 
  | 'MX_GUERRERO' 
  | 'MX_LAZARO_CARDENAS' 
  | 'MX_CDMX'
  | 'HN_ALL'
  | 'SV_ALL'
  | 'BZ_ALL'

export interface CountryConfig {
  code: CountryCode
  name: string
  requiresTaxId: boolean
  taxIdLabel: string
  taxIdPattern?: RegExp
  taxIdPlaceholder: string
  taxIdMinLength: number
  taxIdMaxLength: number
  phoneFormat: {
    pattern: RegExp
    placeholder: string
    minLength: number
    maxLength: number
  }
  cities?: {
    code: CityCode
    name: string
  }[]
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  MX: {
    code: 'MX',
    name: 'México',
    requiresTaxId: true,
    taxIdLabel: 'RFC',
    taxIdPattern: /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/,
    taxIdPlaceholder: 'ABC123456DEF',
    taxIdMinLength: 12,
    taxIdMaxLength: 13,
    phoneFormat: {
      pattern: /^[0-9]{10}$/,
      placeholder: '5512345678',
      minLength: 10,
      maxLength: 10,
    },
    cities: [
      { code: 'MX_COATZACOALCOS', name: 'Coatzacoalcos' },
      { code: 'MX_MINATITLAN', name: 'Minatitlán' },
      { code: 'MX_AGUASCALIENTES', name: 'Aguascalientes' },
      { code: 'MX_GUERRERO', name: 'Guerrero' },
      { code: 'MX_LAZARO_CARDENAS', name: 'Lázaro Cárdenas' },
      { code: 'MX_CDMX', name: 'CDMX' },
    ],
  },
  HN: {
    code: 'HN',
    name: 'Honduras',
    requiresTaxId: false,
    taxIdLabel: 'RTN (Opcional)',
    taxIdPlaceholder: '12345678901234',
    taxIdMinLength: 14,
    taxIdMaxLength: 14,
    phoneFormat: {
      pattern: /^[0-9]{8}$/,
      placeholder: '98765432',
      minLength: 8,
      maxLength: 8,
    },
  },
  SV: {
    code: 'SV',
    name: 'El Salvador',
    requiresTaxId: false,
    taxIdLabel: 'NIT (Opcional)',
    taxIdPlaceholder: '12345678901234',
    taxIdMinLength: 14,
    taxIdMaxLength: 14,
    phoneFormat: {
      pattern: /^[0-9]{8}$/,
      placeholder: '98765432',
      minLength: 8,
      maxLength: 8,
    },
  },
  BZ: {
    code: 'BZ',
    name: 'Belize',
    requiresTaxId: false,
    taxIdLabel: 'Tax ID (Opcional)',
    taxIdPlaceholder: '123456789',
    taxIdMinLength: 9,
    taxIdMaxLength: 9,
    phoneFormat: {
      pattern: /^[0-9]{7}$/,
      placeholder: '1234567',
      minLength: 7,
      maxLength: 7,
    },
  },
}

export function getCountryByCode(code: CountryCode): CountryConfig {
  return COUNTRIES[code]
}

export function getCountryConfig(countryCode: CountryCode | null): CountryConfig | null {
  if (!countryCode || !(countryCode in COUNTRIES)) {
    return null
  }
  return COUNTRIES[countryCode]
}

export function getCityName(cityCode: CityCode): string {
  for (const country of Object.values(COUNTRIES)) {
    if (country.cities) {
      const city = country.cities.find(c => c.code === cityCode)
      if (city) return city.name
    }
  }
  return cityCode
}

export function getCountryFromCityCode(cityCode: CityCode): CountryCode | null {
  if (cityCode.startsWith('MX_')) return 'MX'
  if (cityCode.startsWith('HN_')) return 'HN'
  if (cityCode.startsWith('SV_')) return 'SV'
  if (cityCode.startsWith('BZ_')) return 'BZ'
  return null
}

// Detectar país desde el navegador (opcional)
export function detectCountryFromBrowser(): CountryCode | null {
  if (typeof window === 'undefined') return null
  
  try {
    // Intentar detectar desde timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone.includes('Mexico')) return 'MX'
    if (timezone.includes('Central_America')) {
      // Podría ser HN, SV, o BZ - mejor preguntar
      return null
    }
    
    // Intentar desde locale
    const locale = navigator.language || (navigator as any).userLanguage
    if (locale.includes('es-MX')) return 'MX'
    if (locale.includes('es-HN')) return 'HN'
    if (locale.includes('es-SV')) return 'SV'
    if (locale.includes('en-BZ')) return 'BZ'
    
    return null
  } catch {
    return null
  }
}

