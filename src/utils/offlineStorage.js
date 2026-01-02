// Offline storage utilities
const STORAGE_KEYS = {
  PRODUCTS: 'offline_products',
  ORDERS: 'offline_orders',
  PROFILE: 'offline_profile',
  CART: 'offline_cart'
}

export const offlineStorage = {
  // Save data for offline use
  saveProducts: (products) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  },

  saveOrders: (orders) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  },

  saveProfile: (profile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
  },

  // Get offline data
  getProducts: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    return data ? JSON.parse(data) : []
  },

  getOrders: () => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
    return data ? JSON.parse(data) : []
  },

  getProfile: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE)
    return data ? JSON.parse(data) : null
  },

  // Check if online
  isOnline: () => navigator.onLine,

  // Queue actions for when back online
  queueAction: (action) => {
    const queue = JSON.parse(localStorage.getItem('action_queue') || '[]')
    queue.push({ ...action, timestamp: Date.now() })
    localStorage.setItem('action_queue', JSON.stringify(queue))
  },

  // Process queued actions when back online
  processQueue: async () => {
    const queue = JSON.parse(localStorage.getItem('action_queue') || '[]')
    
    for (const action of queue) {
      try {
        await processQueuedAction(action)
      } catch (error) {
        console.error('Failed to process queued action:', error)
      }
    }
    
    localStorage.removeItem('action_queue')
  }
}

const processQueuedAction = async (action) => {
  const { supabase } = await import('../lib/supabase')
  
  switch (action.type) {
    case 'ADD_PRODUCT':
      await supabase.from('products').insert([action.data])
      break
    case 'UPDATE_PRODUCT':
      await supabase.from('products').update(action.data).eq('id', action.id)
      break
    case 'PLACE_ORDER':
      await supabase.from('orders').insert([action.data])
      break
    default:
      console.log('Unknown action type:', action.type)
  }
}