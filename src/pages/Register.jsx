import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sprout, User, Mail, Lock, MapPin, Phone } from 'lucide-react'
import { signUp, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function Register() {
  const { user, profile } = useAuthStore()
  const { t } = useLanguageStore()
  const [role, setRole] = useState('buyer')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  // Redirect logged-in users to their dashboard
  if (user && profile?.role) {
    return <Navigate to={profile.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      try {
        const { data: authData, error } = await signUp(data.email, data.password)
        
        if (error) {
          console.error('Signup error:', error)
          toast.error(`${t('registrationFailed')}: ${error.message}`)
          return
        }

        // Store registration data for profile creation
        localStorage.setItem('pendingProfile', JSON.stringify({
          full_name: data.full_name,
          role: role,
          phone: data.phone,
          location: data.location
        }))

        toast.success(t('registrationSuccessfulPleaseLogin'))
        navigate('/login')
      } catch (error) {
        console.error('Registration failed:', error)
        toast.error(`${t('registrationFailed')}: ${error.message || t('pleaseTryAgain')}`)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <Sprout className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">{t('createAccount')}</h2>
          <p className="text-gray-600">{t('joinFarmDirectCommunity')}</p>

        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('iAmA')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                role === 'farmer'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sprout className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">{t('farmer')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                role === 'buyer'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <User className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm font-medium">{t('buyer')}</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('fullName')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('full_name', { required: t('fullNameRequired') })}
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('enterFullName')}
              />
            </div>
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('email', { 
                  required: t('emailRequired'),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t('invalidEmail')
                  }
                })}
                type="email"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('enterEmail')}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('phone', { required: t('phoneRequired') })}
                type="tel"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('enterPhone')}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('location')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('location', { required: t('locationRequired') })}
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('enterLocation')}
              />
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('password', { 
                  required: t('passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('passwordMinLength')
                  }
                })}
                type="password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('createPassword')}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            {t('signIn')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}