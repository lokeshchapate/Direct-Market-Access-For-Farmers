// Minimal language store replacement - returns English text only
// Google Translate handles all translations

import { create } from 'zustand'
import { translations } from '../utils/translations'

export const useLanguageStore = create(() => ({
  currentLanguage: 'english',
  t: (key) => translations.english[key] || key,
  setLanguage: () => {}, // No-op
  initialize: () => {} // No-op
}))
