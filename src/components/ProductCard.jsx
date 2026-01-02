import { motion } from 'framer-motion'
import { MapPin, Calendar, User, Shield } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import RatingStars from './RatingStars'

export default function ProductCard({ product, onAddToCart, onViewDetails }) {
  const { t } = useLanguageStore()
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }
  
  // Get product location from localStorage or fallback
  const getProductLocation = () => {
    // Try to get the latest location for this crop
    const latestLocation = localStorage.getItem('latest_product_location')
    if (latestLocation) {
      const locationData = JSON.parse(latestLocation)
      if (locationData.crop === product.crop_name) {
        return locationData.location.address
      }
    }
    
    // Fallback to searching all stored locations
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('product_location_') && key.includes(product.crop_name)
    )
    if (keys.length > 0) {
      const locationData = JSON.parse(localStorage.getItem(keys[0]))
      return locationData.address
    }
    
    return `${product.profiles?.location || 'Karnataka'} (${t('farm')})`
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="card overflow-hidden cursor-pointer"
      onClick={() => onViewDetails && onViewDetails(product)}
    >
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <img
          src={product.image_url || '/api/placeholder/300/200'}
          alt={product.crop_name}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">{product.crop_name}</h3>
            {(product.profiles?.verification_status === 'verified' || localStorage.getItem(`farmer_verified_${product.farmer_id}`) === 'true') && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <Shield className="h-3 w-3" />
                <span>{t('verified')}</span>
              </div>
            )}
          </div>
          <span className="text-xl font-bold text-primary-600">₹{product.price}/{t('kg')}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(product.harvest_date)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className={`font-medium ${
              product.quantity > 0 ? 'text-gray-500' : 'text-red-500'
            }`}>
              {product.quantity > 0 ? `${product.quantity}${t('kg')} ${t('available')}` : t('outOfStock')}
            </span>
          </div>
        </div>
        
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{product.profiles?.full_name || t('farmer')}</span>
            </div>
            {product.profiles?.average_rating > 0 && (
              <RatingStars rating={product.profiles.average_rating} size="sm" />
            )}
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{getProductLocation()}</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToCart(product)
          }}
          disabled={product.quantity === 0}
          className={`w-full mt-4 ${
            product.quantity > 0 
              ? 'btn-primary' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed py-2 px-4 rounded-lg'
          }`}
        >
          {product.quantity > 0 ? t('addToCart') : t('unavailable')}
        </button>
      </div>
    </motion.div>
  )
}