import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sprout, User, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import LocationPicker from './LocationPicker'
import toast from 'react-hot-toast'

export default function ProfileSetup() {
  const { user, setProfile } = useAuthStore()
  const { t } = useLanguageStore()
  const [role, setRole] = useState('buyer')
  const [loading, setLoading] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const createProfile = async () => {
    setLoading(true)
    try {
      // Check for pending profile data from registration
      const pendingProfile = localStorage.getItem('pendingProfile')
      let profileData = {
        id: user.id,
        full_name: user.email.split('@')[0],
        role: role,
        phone: '0000000000',
        location: selectedLocation?.address || 'Not specified',
        verified: false
      }

      if (pendingProfile) {
        const parsed = JSON.parse(pendingProfile)
        profileData = {
          ...profileData,
          full_name: parsed.full_name,
          role: parsed.role,
          phone: parsed.phone,
          location: parsed.location
        }
        localStorage.removeItem('pendingProfile')
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Profile created successfully!')
      
      // Redirect to appropriate dashboard
      if (data.role === 'farmer') {
        window.location.href = '/farmer/dashboard'
      } else {
        window.location.href = '/buyer/dashboard'
      }
    } catch (error) {
      toast.error('Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('completeProfile')}</h2>
          <p className="text-gray-600">{t('chooseRole')}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('iAmA')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setRole('farmer')}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                role === 'farmer'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sprout className="h-8 w-8 mx-auto mb-2" />
              <span className="font-medium">{t('farmer')}</span>
              <p className="text-xs text-gray-500 mt-1">{t('sellProduce')}</p>
            </button>
            <button
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                role === 'buyer'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="h-8 w-8 mx-auto mb-2" />
              <span className="font-medium">{t('buyer')}</span>
              <p className="text-xs text-gray-500 mt-1">{t('buyFreshProduce')}</p>
            </button>
          </div>
        </div>

        {/* Location Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('location')}:
          </label>
          {selectedLocation ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">{selectedLocation.address}</span>
              </div>
              <button
                onClick={() => setShowLocationPicker(true)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                {t('changeLocation')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLocationPicker(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-700"
            >
              <MapPin className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">{t('selectLocation')}</span>
            </button>
          )}
        </div>

        <button
          onClick={createProfile}
          disabled={loading || !selectedLocation}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {loading ? t('creatingProfile') : t('continue')}
        </button>
      </motion.div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={setSelectedLocation}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  )
}