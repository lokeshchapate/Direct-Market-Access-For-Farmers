import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sprout, Users, TrendingUp, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'

export default function Home() {
  const { user, profile } = useAuthStore()
  const { t } = useLanguageStore()
  
  // Redirect logged-in users to their dashboard
  if (user && profile?.role) {
    return <Navigate to={profile.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />
  }
  
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('directConnection'),
      description: t('directConnectionDesc')
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: t('fairPricing'),
      description: t('fairPricingDesc')
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('trustQuality'),
      description: t('trustQualityDesc')
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-earth-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Sprout className="h-16 w-16 text-primary-600 mx-auto mb-6" />
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('directMarketAccess')}
                <span className="block text-primary-600">{t('forFarmers')}</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {t('homeSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-lg px-8 py-3">
                  {t('getStarted')}
                </Link>
                <Link to="/products" className="btn-secondary text-lg px-8 py-3">
                  {t('browseProducts')}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('whyChooseFarmDirect')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('empoweringFarmers')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('about')}</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Lokesh Chapate</h3>
            <div className="space-y-2 text-gray-600">
              <p>Email: lokeshchapate725@gmail.com</p>
              <p>Phone: 9902279352</p>
            </div>
            <p className="mt-6 text-gray-700">
              {t('buildingTechnology')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}