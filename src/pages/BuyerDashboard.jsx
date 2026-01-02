import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Package, Clock, CheckCircle, Star, Truck, X, Shield, Filter, Users, Mic, MicOff, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import ProductCard from '../components/ProductCard'
import ReviewForm from '../components/ReviewForm'
import PaymentGateway from '../components/PaymentGateway'
import OrderTracking from '../components/OrderTracking'

import AdvancedSearch from '../components/AdvancedSearch'
import KarnatakaPrices from '../components/KarnatakaPrices'
import ProductDetails from '../components/ProductDetails'
import LocationPicker from '../components/LocationPicker'
import AdvancedChatbot from '../components/AdvancedChatbot'
import BulkOrderForm from '../components/BulkOrderForm'
import toast from 'react-hot-toast'


export default function BuyerDashboard() {
  const { user } = useAuthStore()
  const { t, currentLanguage } = useLanguageStore()
  const [activeTab, setActiveTab] = useState('browse')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPaymentGateway, setShowPaymentGateway] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

  const [showOrderTracking, setShowOrderTracking] = useState(false)
  const [trackingOrderId, setTrackingOrderId] = useState(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [deliveryLocation, setDeliveryLocation] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState(null)


  useEffect(() => {
    fetchProducts()
    fetchOrders()
    loadCart()
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setSearchTerm(transcript)
        toast.success(`${t('searchingFor')}: ${transcript}`)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast.error(t('voiceSearchFailed'))
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])



  useEffect(() => {
    fetchProducts()
  }, [searchTerm])

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles!products_farmer_id_fkey (full_name, location)
        `)
        .gt('quantity', 0)
        .order('created_at', { ascending: false })
      
      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike('crop_name', `%${searchTerm}%`)
      }
      
      const { data, error } = await query
      
      console.log('Products data with profiles:', data)
      
      if (error) {
        console.error('Products error:', error)
        return
      }
      
      // Process products - even if profile is null, show the product
      let validProducts = data || []
      
      // Additional client-side filtering for better search
      if (searchTerm.trim()) {
        validProducts = validProducts.filter(product =>
          product.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      

      
      setProducts(validProducts)
      return
    } catch (err) {
      console.error('Fetch failed:', err)
    }
  }

  const fetchOrders = async () => {
    console.log('Fetching orders for buyer:', user.id)
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (crop_name, price),
        profiles!orders_farmer_id_fkey (full_name)
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })

    console.log('Orders fetch result:', { data, error })
    
    if (error) {
      console.error('Orders fetch error:', error)
    } else {
      setOrders(data || [])
    }
  }



  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }

  const saveCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    let newCart

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1 }]
    }

    saveCart(newCart)
    toast.success('Added to cart!')
  }

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId)
    saveCart(newCart)
  }

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && quantity > product.quantity) {
      toast.error(`Only ${product.quantity}kg available in stock`)
      return
    }

    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
    saveCart(newCart)
  }

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty!')
      return
    }

    if (!deliveryLocation) {
      setShowLocationPicker(true)
      return
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    setPendingOrder({ items: cart, total, deliveryLocation })
    setShowPaymentGateway(true)
  }

  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      console.log('Placing order with items:', pendingOrder.items)
      console.log('User ID:', user.id)
      
      const orders = pendingOrder.items.map(item => {
        console.log('Processing item:', item)
        return {
          buyer_id: user.id,
          farmer_id: item.farmer_id,
          product_id: item.id,
          quantity: item.quantity,
          total_amount: item.price * item.quantity,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: paymentMethod === 'cod' ? 'pending' : 'completed'
        }
      })

      console.log('Orders to insert:', orders)

      const { data, error } = await supabase
        .from('orders')
        .insert(orders)
        .select()

      if (error) {
        console.error('Order insertion error:', error)
        toast.error(`Order failed: ${error.message}`)
        return
      }

      // Update product quantities after successful order
      for (const item of pendingOrder.items) {
        // Get current product quantity from database
        const { data: currentProduct } = await supabase
          .from('products')
          .select('quantity')
          .eq('id', item.id)
          .single()
        
        if (currentProduct) {
          const newQuantity = Math.max(0, currentProduct.quantity - item.quantity)
          
          const { error: updateError } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', item.id)
          
          if (updateError) {
            console.error('Failed to update product quantity:', updateError)
          } else {
            // Create notification for farmer about product sold
            const notification = {
              farmer_id: item.farmer_id,
              type: 'product_sold',
              title: 'Product Sold',
              message: `${item.quantity}kg of ${item.crop_name} has been sold`,
              created_at: new Date().toISOString()
            }
            
            // Store notification (in real app, this would be in database)
            localStorage.setItem(`farmer_notification_${Date.now()}`, JSON.stringify(notification))
            
            // Check if product is out of stock
            if (newQuantity === 0) {
              const outOfStockNotification = {
                farmer_id: item.farmer_id,
                type: 'out_of_stock',
                title: 'Product Out of Stock',
                message: `${item.crop_name} is now out of stock. Consider restocking.`,
                created_at: new Date().toISOString()
              }
              
              localStorage.setItem(`farmer_notification_${Date.now() + 1}`, JSON.stringify(outOfStockNotification))
            }
          }
        }
      }

      console.log('Orders inserted successfully:', data)
      saveCart([])
      fetchProducts() // Refresh products to show updated quantities
      fetchOrders()
      setShowPaymentGateway(false)
      setPendingOrder(null)
      setActiveTab('orders')
      toast.success('Order placed successfully!')
    } catch (error) {
      console.error('Payment success error:', error)
      toast.error(`Failed to place order: ${error.message}`)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'accepted': return 'text-blue-600 bg-blue-100'
      case 'shipped': return 'text-purple-600 bg-purple-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t('pending')
      case 'accepted': return t('accepted')
      case 'shipped': return t('shipped')
      case 'delivered': return t('delivered')
      case 'rejected': return t('rejected')
      case 'cancelled': return t('cancelled')
      default: return status
    }
  }
  
  const startVoiceSearch = () => {
    if (!recognition) {
      toast.error(t('voiceSearchNotSupported'))
      return
    }
    
    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognition.start()
      toast.success(t('listening'))
    }
  }

  const cancelOrder = async (orderId) => {
    if (!confirm(t('confirmCancelOrder'))) return
    
    try {
      console.log('Cancelling order:', orderId, 'for buyer:', user.id)
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .select()

      console.log('Cancel result:', { data, error })
      
      if (error) {
        console.error('Cancel error details:', error)
        toast.error(`Cancel failed: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        toast.error(t('orderNotFoundOrNotAuthorized'))
        return
      }

      toast.success(t('orderCancelledSuccessfully'))
      fetchOrders()
    } catch (error) {
      console.error('Cancel order error:', error)
      toast.error(`Failed to cancel order: ${error.message}`)
    }
  }

  const tabs = [
    { id: 'browse', label: t('browseProducts'), icon: Package },
    { id: 'cart', label: t('myCart'), icon: ShoppingCart },
    { id: 'orders', label: t('myOrders'), icon: Clock },
    { id: 'prices', label: t('marketPrices'), icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" key={currentLanguage}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                    {tab.id === 'cart' && cart.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'browse' && (
              <div>
                {/* Search and Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={t('searchCrops')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      onClick={startVoiceSearch}
                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={isListening ? t('stopListening') : t('voiceSearch')}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAdvancedSearch(true)}
                    className="btn-secondary px-4 flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>{t('advanced')}</span>
                  </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onViewDetails={(product) => {
                        setSelectedProduct(product)
                        setShowProductDetails(true)
                      }}
                    />
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('noProductsFound')}</p>
                    <button 
                      onClick={fetchProducts}
                      className="mt-4 btn-secondary"
                    >
                      {t('refreshProducts')}
                    </button>
                  </div>
                )}
              </div>
            )}



            {activeTab === 'cart' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">{t('shoppingCart')}</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('yourCartIsEmpty')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image_url || '/api/placeholder/80/80'}
                            alt={item.crop_name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">{item.crop_name}</h4>
                            <p className="text-sm text-gray-600">₹{item.price}/kg</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={products.find(p => p.id === item.id)?.quantity || item.quantity}
                              value={item.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value) || 1
                                updateCartQuantity(item.id, newQty)
                              }}
                              className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium">₹{item.price * item.quantity}</p>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 text-sm hover:text-red-700"
                            >
                              {t('remove')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      {/* Delivery Location */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('deliveryLocation')}:
                        </label>
                        {deliveryLocation ? (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{deliveryLocation.address}</span>
                              <button
                                onClick={() => setShowLocationPicker(true)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                {t('change')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowLocationPicker(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-700"
                          >
                            {t('selectDeliveryLocation')}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-medium">{t('total')}:</span>
                        <span className="text-xl font-bold text-primary-600">
                          ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                        </span>
                      </div>
                      <button
                        onClick={placeOrder}
                        className="w-full btn-primary py-3"
                      >
                        {deliveryLocation ? t('proceedToPayment') : t('selectLocationProceed')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'prices' && (
              <KarnatakaPrices />
            )}

            {activeTab === 'orders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{t('myOrders')}</h3>
                  <button
                    onClick={fetchOrders}
                    className="btn-secondary text-sm px-3 py-1"
                  >
                    {t('refresh')}
                  </button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('noOrdersYet')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{order.products.crop_name}</h4>
                            <p className="text-sm text-gray-600">{t('from')}: {order.profiles.full_name}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            {order.payment_method && (
                              <div className="text-xs text-gray-500 mt-1">
                                {order.payment_method.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                          <span>{t('quantity')}: {order.quantity}{t('kg')}</span>
                          <span className="font-medium text-gray-900">₹{order.total_amount}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setTrackingOrderId(order.id)
                              setShowOrderTracking(true)
                            }}
                            className="w-full btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                          >
                            <Truck className="h-4 w-4" />
                            <span>{t('trackOrder')}</span>
                          </button>
                          
                          {(order.status === 'pending' || order.status === 'accepted') && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 flex items-center justify-center space-x-1 rounded-lg"
                            >
                              <X className="h-4 w-4" />
                              <span>{t('cancelOrder')}</span>
                            </button>
                          )}
                          
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowReviewForm(true)
                              }}
                              className="w-full btn-secondary text-sm py-2 flex items-center justify-center space-x-1"
                            >
                              <Star className="h-4 w-4" />
                              <span>{t('rateAndReview')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviewForm && selectedOrder && (
        <ReviewForm
          order={selectedOrder}
          onClose={() => {
            setShowReviewForm(false)
            setSelectedOrder(null)
          }}
          onSubmit={fetchOrders}
        />
      )}

      {showPaymentGateway && pendingOrder && (
        <PaymentGateway
          order={pendingOrder}
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentGateway(false)
            setPendingOrder(null)
          }}
        />
      )}



      {showOrderTracking && trackingOrderId && (
        <OrderTracking
          orderId={trackingOrderId}
          onClose={() => {
            setShowOrderTracking(false)
            setTrackingOrderId(null)
          }}
        />
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          onSearch={(filters) => {
            console.log('Advanced search filters:', filters)
            // Apply advanced filters to product search
            fetchProducts()
          }}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {showProductDetails && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => {
            setShowProductDetails(false)
            setSelectedProduct(null)
          }}
          onAddToCart={addToCart}
        />
      )}

      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={(location) => {
            setDeliveryLocation(location)
            setShowLocationPicker(false)
            if (!pendingOrder) {
              toast.success(t('deliveryLocationSet'))
            } else {
              // Continue with order placement
              const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
              setPendingOrder({ items: cart, total, deliveryLocation: location })
              setShowPaymentGateway(true)
            }
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}



      <AdvancedChatbot role="buyer" />
      </div>
    </div>
  )
}