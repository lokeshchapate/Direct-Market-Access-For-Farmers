import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'

export default function InstallPrompt() {
  const { t } = useLanguageStore()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 30 seconds or on user interaction
      setTimeout(() => {
        if (!localStorage.getItem('pwa_install_dismissed')) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  return (
    <AnimatePresence>
      {showPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl border p-4 z-50 max-w-sm mx-auto"
        >
          <div className="flex items-start space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Smartphone className="h-6 w-6 text-primary-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {t('installFarmMarketApp')}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t('getFullAppExperience')}
              </p>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  className="flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  <Download className="h-4 w-4" />
                  <span>{t('install')}</span>
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-gray-600 text-sm hover:text-gray-800"
                >
                  {t('notNow')}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}