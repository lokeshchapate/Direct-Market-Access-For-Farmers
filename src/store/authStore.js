import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, loading: false })
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        // Check for verification status in localStorage
        if (profile) {
          const isVerified = localStorage.getItem(`farmer_verified_${user.id}`) === 'true'
          if (isVerified) {
            profile.verification_status = 'verified'
          }
        }
        
        set({ profile })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser, setProfile } = useAuthStore.getState()
  
  if (session?.user) {
    setUser(session.user)
    // Fetch profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        // Check for verification status in localStorage
        if (data) {
          const isVerified = localStorage.getItem(`farmer_verified_${session.user.id}`) === 'true'
          if (isVerified) {
            data.verification_status = 'verified'
          }
        }
        setProfile(data)
      })
  } else {
    setUser(null)
    setProfile(null)
  }
})