import { ref, computed } from 'vue'
import translations from '../locales/translations.json'

// Current language state
const currentLanguage = ref('en')

// Available languages
export const availableLanguages = Object.keys(translations)

// Get current language
export const getCurrentLanguage = () => currentLanguage.value

// Set language
export const setLanguage = (language) => {
  if (availableLanguages.includes(language)) {
    currentLanguage.value = language
    // Save to localStorage for persistence
    localStorage.setItem('preferred-language', language)
  }
}

// Initialize language from localStorage or browser language
export const initializeLanguage = () => {
  const saved = localStorage.getItem('preferred-language')
  if (saved && availableLanguages.includes(saved)) {
    currentLanguage.value = saved
  } else {
    // Try to detect browser language
    const browserLang = navigator.language.split('-')[0]
    if (availableLanguages.includes(browserLang)) {
      currentLanguage.value = browserLang
    }
  }
}

// Translation function
const getNestedTranslation = (obj, keys) => {
  let result = obj
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return null
    }
  }
  return result
}

const replaceParams = (text, params) => {
  if (typeof text !== 'string' || Object.keys(params).length === 0) {
    return text
  }
  
  return text.replaceAll(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== null && params[param] !== undefined ? params[param] : match
  })
}

export const t = (key, params = {}) => {
  const keys = key.split('.')
  
  // Try current language first
  let translation = getNestedTranslation(translations[currentLanguage.value], keys)
  
  // Fallback to English if not found
  if (translation === null) {
    translation = getNestedTranslation(translations.en, keys)
    if (translation === null) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }
  
  return replaceParams(translation, params)
}

// Composable for use in Vue components
export const useTranslations = () => {
  return {
    t,
    currentLanguage: computed(() => currentLanguage.value),
    setLanguage,
    availableLanguages,
    initializeLanguage
  }
}

// Initialize on import
initializeLanguage()