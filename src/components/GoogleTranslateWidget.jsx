import { useEffect, useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function GoogleTranslateWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState('en')

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
  ]

  useEffect(() => {
    const scriptId = 'google-translate-script'

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    }

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,kn,te,ta,ml,mr,gu,bn,pa',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        )
      }
    }

    // Hide Google Translate elements
    const style = document.createElement('style')
    style.innerHTML = `
      .goog-te-banner-frame { display: none !important; }
      body { top: 0 !important; }
      .skiptranslate { display: none !important; }
      #google_translate_element { visibility: hidden; height: 0; overflow: hidden; }
    `
    document.head.appendChild(style)
  }, [])

  const changeLanguage = (langCode) => {
    if (langCode === 'en') {
      // Clear translation cookies to restore default English
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC`
      setCurrentLang('en')
      setIsOpen(false)
      window.location.reload()
      return
    }

    const iframe = document.querySelector('.goog-te-menu-frame')
    if (!iframe) {
      const trigger = document.querySelector('.goog-te-combo')
      if (trigger) {
        trigger.value = langCode
        trigger.dispatchEvent(new Event('change'))
      }
    }
    
    const domain = window.location.hostname
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`
    document.cookie = `googtrans=/en/${langCode}; path=/`
    
    setCurrentLang(langCode)
    setIsOpen(false)
    window.location.reload()
  }

  const selectedLanguage = languages.find(lang => lang.code === currentLang)

  return (
    <div className="relative">
      <div id="google_translate_element" style={{ position: 'absolute', left: '-9999px' }} />
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        style={{ textTransform: 'none' }}
      >
        <Globe className="h-4 w-4" />
        <span style={{ textTransform: 'none' }}>{selectedLanguage?.native}</span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50"
        >
          <div className="py-2">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                style={{ textTransform: 'none' }}
              >
                <div style={{ textTransform: 'none' }}>
                  <div className="font-medium" style={{ textTransform: 'none' }}>{language.native}</div>
                  <div className="text-xs text-gray-500" style={{ textTransform: 'none' }}>{language.name}</div>
                </div>
                {currentLang === language.code && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
