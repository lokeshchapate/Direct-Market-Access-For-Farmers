import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Sprout, Mail, Lock } from 'lucide-react'
import { signIn, supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const t = (key) => {
  const translations = {
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Sign in to your account',
    email: 'Email',
    password: 'Password',
    emailRequired: 'Email is required',
    invalidEmail: 'Invalid email address',
    passwordRequired: 'Password is required',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    signingIn: 'Signing in...',
    loginButton: 'Sign In',
    dontHaveAccount: "Don't have an account?",
    createAccount: 'Create Account',
    adminLogin: 'Admin Login'
  }
  return translations[key] || key
}

export default function Login() {
  const { user, profile } = useAuthStore()
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
      const { data: authData, error } = await signIn(data.email, data.password)
      
      if (error) throw error

      // Get user profile to determine redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      toast.success('Login successful!')
      
      // Redirect based on role
      if (profile?.role === 'farmer') {
        navigate('/farmer/dashboard')
      } else if (profile?.role === 'buyer') {
        navigate('/buyer/dashboard')
      } else {
        navigate('/')
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
          <h2 className="text-2xl font-bold text-gray-900">{t('welcomeBack')}</h2>
          <p className="text-gray-600">{t('loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder={t('enterYourEmail')}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('password', { required: t('passwordRequired') })}
                type="password"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t('enterYourPassword')}
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
            {loading ? t('signingIn') : t('loginButton')}
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <p className="text-center text-sm text-gray-600">
            {t('dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              {t('createAccount')}
            </Link>
          </p>
          
          <div className="text-center">
            <Link 
              to="/admin/login"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {t('adminLogin')}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}