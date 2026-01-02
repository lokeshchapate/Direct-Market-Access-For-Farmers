import { useState, useEffect } from 'react'
import { MapPin, Navigation, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LocationPicker({ onLocationSelect, onClose }) {
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [watchId, setWatchId] = useState(null)
  const [locationAddress, setLocationAddress] = useState('')

  const getCurrentLocation = () => {
    setLoading(true)
    console.log('Starting GPS tracking...')
    
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by this browser')
      setLoading(false)
      return
    }

    let bestAccuracy = Infinity
    let attempts = 0
    const maxAttempts = 5

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        attempts++
        
        console.log(`GPS attempt ${attempts}:`, latitude, longitude, 'Accuracy:', accuracy + 'm')
        
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy
          setLocation({ lat: latitude, lng: longitude, accuracy })
          
          // Get address from coordinates using free service
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setLocationAddress(data.display_name)
              }
            })
            .catch(() => {
              setLocationAddress(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
            })
          
          if (accuracy <= 20) {
            navigator.geolocation.clearWatch(id)
            setLoading(false)
            toast.success(`High-precision GPS found (±${Math.round(accuracy)}m)`)
          } else if (attempts >= maxAttempts) {
            navigator.geolocation.clearWatch(id)
            setLoading(false)
            toast.success(`Best available accuracy: ±${Math.round(accuracy)}m`)
          }
        }
      },
      (error) => {
        console.error('GPS tracking failed:', error)
        navigator.geolocation.clearWatch(id)
        setLoading(false)
        
        const errorMessages = {
          1: 'GPS access denied. Please enable location permissions and refresh.',
          2: 'GPS unavailable. Check device settings or enter location manually.',
          3: 'GPS timeout. Move to open area or enter coordinates manually.'
        }
        
        toast.error(errorMessages[error.code] || 'Unable to get GPS location')
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    )
    
    setWatchId(id)
    
    // Stop after 15 seconds if no good accuracy achieved
    setTimeout(() => {
      if (id) {
        navigator.geolocation.clearWatch(id)
        setLoading(false)
        if (location) {
          toast.success(`GPS tracking stopped. Using best result: ±${Math.round(location.accuracy)}m`)
        } else {
          toast.error('GPS timeout. Please enter location manually or try again in an open area.')
        }
      }
    }, 15000)
  }

  const handleConfirm = () => {
    let finalLocation = location
    let finalAddress = address.trim()
    
    // Check if user entered coordinates manually
    if (finalAddress.includes(',')) {
      const coords = finalAddress.split(',').map(c => parseFloat(c.trim()))
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        finalLocation = { lat: coords[0], lng: coords[1], accuracy: 0 }
        finalAddress = `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
      }
    }
    
    if (finalLocation) {
      // Prioritize user input, then locationAddress, then coordinates
      const addressToUse = finalAddress || locationAddress || `${finalLocation.lat.toFixed(6)}, ${finalLocation.lng.toFixed(6)}`
      onLocationSelect({
        coordinates: finalLocation,
        address: addressToUse,
        city: extractCity(addressToUse)
      })
      onClose()
    }
  }

  const extractCity = (fullAddress) => {
    // Simple city extraction - can be improved
    const parts = fullAddress.split(',')
    return parts.length > 2 ? parts[parts.length - 3].trim() : parts[0].trim()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Select Location</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Location Button */}
          <button
            onClick={getCurrentLocation}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Navigation className="h-5 w-5 text-blue-600" />
            <span>{loading ? 'Tracking GPS...' : 'Use GPS Location'}</span>
          </button>

          {/* GPS Status */}
          {location && (
            <div className={`p-3 border rounded-lg ${
              location.accuracy <= 50 ? 'bg-green-50 border-green-200' :
              location.accuracy <= 100 ? 'bg-yellow-50 border-yellow-200' :
              'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    location.accuracy <= 50 ? 'bg-green-500' :
                    location.accuracy <= 100 ? 'bg-yellow-500' :
                    'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      location.accuracy <= 50 ? 'text-green-900' :
                      location.accuracy <= 100 ? 'text-yellow-900' :
                      'text-orange-900'
                    }`}>
                      {locationAddress || `GPS: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                    </p>
                    <p className={`text-xs ${
                      location.accuracy <= 50 ? 'text-green-700' :
                      location.accuracy <= 100 ? 'text-yellow-700' :
                      'text-orange-700'
                    }`}>
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>
                {locationAddress && (
                  <button
                    onClick={() => setAddress(locationAddress)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )}
          


          {/* Poor GPS Warning */}
          {location && location.accuracy > 1000 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">⚠️ Poor GPS Signal</p>
              <p className="text-xs text-red-700 mt-1">
                • Move to an open area away from buildings
                • Enable high-accuracy mode in device settings
                • Or enter coordinates manually below
              </p>
            </div>
          )}

          {/* Manual Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locationAddress ? 'Edit address:' : 'Enter address or coordinates:'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address or lat,lng (e.g. 12.9237,77.6634)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => {
                if (watchId) navigator.geolocation.clearWatch(watchId)
                onClose()
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!location && !address.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}