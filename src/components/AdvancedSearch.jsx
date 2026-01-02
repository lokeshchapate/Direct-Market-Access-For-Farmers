import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, MapPin, Calendar, DollarSign, Package, X } from 'lucide-react'

export default function AdvancedSearch({ onSearch, onClose }) {
  const [filters, setFilters] = useState({
    crop: '',
    location: '',
    priceMin: '',
    priceMax: '',
    quantityMin: '',
    harvestDateFrom: '',
    harvestDateTo: '',
    organic: false,
    verified: false
  })

  const cropOptions = [
    'Tomato', 'Onion', 'Potato', 'Rice', 'Wheat', 'Cabbage', 'Carrot', 
    'Cucumber', 'Okra', 'Spinach', 'Corn', 'Brinjal', 'Cauliflower'
  ]

  const locationOptions = [
    'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ]

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
    onClose()
  }

  const clearFilters = () => {
    setFilters({
      crop: '',
      location: '',
      priceMin: '',
      priceMax: '',
      quantityMin: '',
      harvestDateFrom: '',
      harvestDateTo: '',
      organic: false,
      verified: false
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Advanced Search
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="h-4 w-4 inline mr-1" />
              Crop Type
            </label>
            <select
              value={filters.crop}
              onChange={(e) => handleFilterChange('crop', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Crops</option>
              {cropOptions.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Locations</option>
              {locationOptions.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Price Range (₹/kg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min price"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                placeholder="Max price"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Quantity (kg)
            </label>
            <input
              type="number"
              placeholder="Minimum quantity available"
              value={filters.quantityMin}
              onChange={(e) => handleFilterChange('quantityMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Harvest Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Harvest Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={filters.harvestDateFrom}
                onChange={(e) => handleFilterChange('harvestDateFrom', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="date"
                value={filters.harvestDateTo}
                onChange={(e) => handleFilterChange('harvestDateTo', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Special Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.organic}
                  onChange={(e) => handleFilterChange('organic', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Organic Products Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Farmers Only</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-4 border-t bg-gray-50">
          <button onClick={clearFilters} className="btn-secondary flex-1">
            Clear All
          </button>
          <button onClick={handleSearch} className="btn-primary flex-1">
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  )
}