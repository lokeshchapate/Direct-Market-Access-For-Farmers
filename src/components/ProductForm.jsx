import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { X, Upload, Camera, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLanguageStore } from '../store/languageStore'
import LocationPicker from './LocationPicker'
import toast from 'react-hot-toast'

export default function ProductForm({ product, onSubmit, onClose }) {
  const { t } = useLanguageStore()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url || null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(product?.location || null)
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product ? {
      crop_name: product.crop_name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      harvest_date: product.harvest_date
    } : {}
  })

  const uploadImage = async (file) => {
    console.log('Uploading image:', file.name, file.size)
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${fileName}`

    console.log('Upload path:', filePath)

    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    console.log('Upload result:', { data, uploadError })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw uploadError
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    console.log('Public URL:', urlData.publicUrl)
    return urlData.publicUrl
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleFormSubmit = async (data) => {
    setLoading(true)
    try {
      let imageUrl = product?.image_url || 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400'
      
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (error) {
          console.error('Image upload error:', error)
          toast.error('Failed to upload image, keeping existing')
        }
      }
      
      await onSubmit({
        ...data,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity),
        image_url: imageUrl
      })
      
      // Store location data with product ID until database is updated
      if (selectedLocation) {
        const productKey = `product_location_${data.crop_name}_${Date.now()}`
        localStorage.setItem(productKey, JSON.stringify(selectedLocation))
        localStorage.setItem('latest_product_location', JSON.stringify({
          crop: data.crop_name,
          location: selectedLocation,
          timestamp: Date.now()
        }))
      }

      toast.success(t('productAddedSuccessfully'))
      onClose()
    } catch (error) {
      console.error('Product form error:', error)
      toast.error(t('failedToAddProduct'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? t('editProduct') : t('addNewProduct')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('cropName')}
            </label>
            <input
              {...register('crop_name', { required: t('cropNameRequired') })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t('cropNamePlaceholder')}
            />
            {errors.crop_name && (
              <p className="text-red-500 text-sm mt-1">{errors.crop_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              {...register('description', { required: t('descriptionRequired') })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={t('descriptionPlaceholder')}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('pricePerKg')}
              </label>
              <input
                {...register('price', { 
                  required: t('priceRequired'),
                  min: { value: 0.01, message: t('priceMustBeGreaterThanZero') }
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('quantityKg')}
              </label>
              <input
                {...register('quantity', { 
                  required: t('quantityRequired'),
                  min: { value: 1, message: t('quantityMustBeAtLeastOne') }
                })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('harvestDate')}
            </label>
            <input
              {...register('harvest_date', { required: t('harvestDateRequired') })}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {errors.harvest_date && (
              <p className="text-red-500 text-sm mt-1">{errors.harvest_date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('farmLocation')}
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  {selectedLocation ? t('changeLocation') : t('selectFarmLocation')}
                </span>
              </button>
              {selectedLocation && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    📍 {selectedLocation.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('productImage')}
            </label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">{t('clickToUpload')}</p>
                    <p className="text-xs text-gray-500">{t('pngJpgUpTo5MB')}</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? (product ? t('updating') : t('adding')) : (product ? t('updateProduct') : t('addProduct'))}
            </button>
          </div>
        </form>
      </motion.div>
      
      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={(location) => {
            setSelectedLocation(location)
            setShowLocationPicker(false)
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  )
}