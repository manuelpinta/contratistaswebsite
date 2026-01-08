// Utilidades de debug para cambiar el país desde la consola del navegador
// Usa esto en la consola: window.setCountry('MX') o window.setCountry('HN')

import { COUNTRIES, type CountryCode } from './countries'

declare global {
  interface Window {
    setCountry: (code: CountryCode) => void
    getCountry: () => CountryCode | null
    clearCountry: () => void
    listCountries: () => void
  }
}

if (typeof window !== 'undefined') {
  window.setCountry = (code: CountryCode) => {
    if (code in COUNTRIES) {
      localStorage.setItem('selectedCountry', code)
      console.log(`✅ País cambiado a: ${COUNTRIES[code].name}`)
      console.log(`📍 Configuración:`, COUNTRIES[code])
      return COUNTRIES[code]
    } else {
      console.error(`❌ Código de país inválido: ${code}`)
      console.log('Países disponibles:', Object.keys(COUNTRIES))
      return null
    }
  }

  window.getCountry = () => {
    const stored = localStorage.getItem('selectedCountry')
    if (stored && stored in COUNTRIES) {
      const country = COUNTRIES[stored as CountryCode]
      console.log(`📍 País actual: ${country.name} (${stored})`)
      console.log(`📍 Configuración:`, country)
      return stored as CountryCode
    }
    console.log('📍 No hay país seleccionado')
    return null
  }

  window.clearCountry = () => {
    localStorage.removeItem('selectedCountry')
    console.log('✅ País eliminado. Se mostrará el selector al registrarse.')
  }

  window.listCountries = () => {
    console.log('🌍 Países disponibles:')
    Object.values(COUNTRIES).forEach(country => {
      console.log(`  ${country.code}: ${country.name}`)
      console.log(`    - Tax ID: ${country.taxIdLabel} ${country.requiresTaxId ? '(Requerido)' : '(Opcional)'}`)
      console.log(`    - Teléfono: ${country.phoneFormat.placeholder}`)
      console.log(`    - Ciudades: ${country.cities ? country.cities.length : 0}`)
    })
  }

  console.log('🔧 Utilidades de país cargadas. Usa:')
  console.log('  - window.setCountry("MX") - Cambiar a México')
  console.log('  - window.setCountry("HN") - Cambiar a Honduras')
  console.log('  - window.setCountry("SV") - Cambiar a El Salvador')
  console.log('  - window.setCountry("BZ") - Cambiar a Belize')
  console.log('  - window.getCountry() - Ver país actual')
  console.log('  - window.clearCountry() - Limpiar país')
  console.log('  - window.listCountries() - Listar todos los países')
}

