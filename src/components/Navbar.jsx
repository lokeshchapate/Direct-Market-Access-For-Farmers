import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sprout, User, LogOut, ShoppingCart, Shield, HelpCircle, Phone, Mail, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import GoogleTranslateWidget from './GoogleTranslateWidget'
import NotificationCenter from './NotificationCenter'
import FarmerVerification from './FarmerVerification'

// Static English translations
const t = (key) => {
  const translations = {
    farmerDashboard: 'Farmer Dashboard',
    buyerDashboard: 'Buyer Dashboard',
    marketPrices: 'Market Prices',
    verifyProfile: 'Verify Profile',
    noRole: 'No Role',
    help: 'Help',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    profileVerification: 'Profile Verification',
    helpSupport: 'Help & Support',
    needAssistance: 'Need assistance? Contact our support team:',
    callSupport: 'Call Support',
    emailSupport: 'Email Support'
  }
  return translations[key] || key
}

export default function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [showVerification, setShowVerification] = useState(false)
  const [showHelp, setShowHelp] = useState(false)


  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-md border-b border-gray-200 relative"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.03'%3E%3Cpath d='M10 10L0 0h20v20L10 10z'/%3E%3C/g%3E%3C/svg%3E")`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user && profile?.role ? (profile.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard') : '/'} className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">FarmDirect</span>
          </Link>

          <div className="flex items-center space-x-4">
           {/* 👇 Auto-translate dropdown visible on all pages */}
  <div className="hidden sm:block">
    <GoogleTranslateWidget />
  </div>
            {user ? (
              <>
                <div className="flex items-center space-x-4">
                  {profile?.role === 'farmer' && (
                    <>
                      <Link 
                        to="/farmer/dashboard"
                        className="px-3 py-2 text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                      >
                        🌱 {t('farmerDashboard')}
                      </Link>
                      <button
                        onClick={() => setShowVerification(true)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        <span>{t('verifyProfile')}</span>
                      </button>

                    </>
                  )}
                  {profile?.role === 'buyer' && (
                    <>
                      <Link 
                        to="/buyer/dashboard"
                        className="px-3 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                      >
                        🛒 {t('buyerDashboard')}
                      </Link>
                    </>
                  )}
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="h-5 w-5" />
                    <span>{profile?.full_name || user?.email || 'User'}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {profile?.role || t('noRole')}
                    </span>
                  </div>
                  <NotificationCenter />
                  <button
                    onClick={() => setShowHelp(true)}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>{t('help')}</span>
                  </button>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="btn-secondary">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Verification Modal */}
      <AnimatePresence>
        {showVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVerification(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('profileVerification')}</h2>
                  <button
                    onClick={() => setShowVerification(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <FarmerVerification />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{t('helpSupport')}</h2>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600">{t('needAssistance')}</p>
                  <div className="space-y-3">
                    <a
                      href="tel:9902279352"
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{t('callSupport')}</p>
                        <p className="text-sm text-gray-600">9902279352</p>
                      </div>
                    </a>
                    <a
                      href="mailto:lokeshchapate725@gmail.com"
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Mail className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">{t('emailSupport')}</p>
                        <p className="text-sm text-gray-600">lokeshchapate725@gmail.com</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}