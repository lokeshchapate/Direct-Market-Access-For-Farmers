import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Check, AlertCircle, FileText, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function FarmerVerification() {
  const { user, profile, setProfile } = useAuthStore()
  const { t } = useLanguageStore()
  const [documents, setDocuments] = useState({
    aadhaar: null,
    landRecords: null,
    bankPassbook: null,
    photo: null
  })
  const [farmerInfo, setFarmerInfo] = useState({
    phone: '',
    location: ''
  })
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFileUpload = async (file, type) => {
    if (!file) return null

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      throw new Error('Only JPG, JPEG, PNG, WEBP, and PDF files are allowed')
    }

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`verification/${fileName}`, file)

      if (error) {
        console.error('Storage upload error:', error)
        if (error.message.includes('bucket')) {
          throw new Error('Storage bucket not found. Using fallback storage.')
        }
        throw new Error(`Upload failed: ${error.message}`)
      }

      return fileName // Return the file path instead of public URL for private documents
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  const handleSubmit = async () => {
    if (!documents.aadhaar || !documents.landRecords || !documents.photo) {
      toast.error('Please upload all required documents')
      return
    }

    setUploading(true)
    try {
      // Upload all documents
      const uploadPromises = Object.entries(documents).map(async ([type, file]) => {
        if (file) {
          try {
            const filePath = await handleFileUpload(file, type)
            return [type, filePath]
          } catch (uploadError) {
            throw new Error(`Failed to upload ${type}: ${uploadError.message}`)
          }
        }
        return [type, null]
      })

      const uploadedDocs = await Promise.all(uploadPromises)
      const docPaths = Object.fromEntries(uploadedDocs.filter(([, path]) => path))

      // Store verification data locally for now
      localStorage.setItem(`verification_${user.id}`, JSON.stringify({
        documents: docPaths,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        farmerInfo: farmerInfo
      }))

      // Update local profile state
      setProfile({
        ...profile,
        verification_status: 'pending',
        verification_documents: docPaths
      })

      setSubmitted(true)
      toast.success('Verification documents submitted successfully!')
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(error.message || 'Failed to submit verification documents')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setDocuments(prev => ({ ...prev, [type]: file }))
    }
  }

  const localVerification = localStorage.getItem(`verification_${user?.id}`)
  const isSubmitted = submitted || profile?.verification_status === 'pending' || localVerification
  
  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">{t('verificationSubmitted')}</h3>
        <p className="text-gray-600">{t('documentsUnderReview')}</p>
      </div>
    )
  }

  if (profile?.verification_status === 'verified' && !localVerification) {
    return (
      <div className="text-center py-8">
        <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">{t('profileVerified')}</h3>
        <p className="text-gray-600">{t('farmerProfileVerified')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('farmerProfileVerification')}</h3>
        <p className="text-gray-600">{t('uploadRequiredDocuments')}</p>
      </div>

      <div className="space-y-6">
        {/* Aadhaar Card */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">{t('aadhaarCard')}</h4>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, 'aadhaar')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {documents.aadhaar && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.aadhaar.name}</p>
          )}
        </div>

        {/* Land Records */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-gray-900">{t('landRecords')}</h4>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, 'landRecords')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
          {documents.landRecords && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.landRecords.name}</p>
          )}
        </div>

        {/* Bank Passbook */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FileText className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-900">{t('bankPassbook')}</h4>
            <span className="text-gray-400">{t('optional')}</span>
          </div>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => handleFileChange(e, 'bankPassbook')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {documents.bankPassbook && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.bankPassbook.name}</p>
          )}
        </div>

        {/* Photo */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Camera className="h-5 w-5 text-orange-600" />
            <h4 className="font-medium text-gray-900">{t('profilePhoto')}</h4>
            <span className="text-red-500">*</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'photo')}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {documents.photo && (
            <p className="text-sm text-green-600 mt-2">✓ {documents.photo.name}</p>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">{t('importantNotes')}</h4>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>{t('documentsReadable')}</li>
              <li>{t('verificationTime')}</li>
              <li>{t('verifiedPriority')}</li>
              <li>{t('documentsSecure')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Farmer Information */}
      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('phoneNumber')} *
          </label>
          <input
            type="tel"
            value={farmerInfo.phone}
            onChange={(e) => setFarmerInfo({...farmerInfo, phone: e.target.value})}
            placeholder={t('enterPhoneNumber')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('farmLocation')} *
          </label>
          <input
            type="text"
            value={farmerInfo.location}
            onChange={(e) => setFarmerInfo({...farmerInfo, location: e.target.value})}
            placeholder={t('enterFarmLocation')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSubmit}
          disabled={uploading || !documents.aadhaar || !documents.landRecords || !documents.photo || !farmerInfo.phone.trim() || !farmerInfo.location.trim()}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {uploading ? t('uploadingDocuments') : t('submitForVerification')}
        </button>
      </div>
    </div>
  )
}