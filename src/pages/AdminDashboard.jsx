import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Check, X, Shield, Package, Users, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const { t } = useLanguageStore()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [verificationRequests, setVerificationRequests] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchFarmers()
    fetchVerificationRequests()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, profiles(full_name, location)`)
        .order('created_at', { ascending: false })
      
      if (!error) setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchFarmers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'farmer')
        .order('created_at', { ascending: false })
      
      if (!error) {
        // Add verification status from localStorage
        const farmersWithVerification = (data || []).map(farmer => ({
          ...farmer,
          verification_status: localStorage.getItem(`farmer_verified_${farmer.id}`) === 'true' 
            ? 'verified' 
            : farmer.verification_status || 'unverified'
        }))
        setFarmers(farmersWithVerification)
      }
    } catch (error) {
      console.error('Error fetching farmers:', error)
    }
  }

  const fetchVerificationRequests = () => {
    // Get from localStorage for now
    const requests = []
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('verification_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key))
          const userId = key.replace('verification_', '')
          
          // Also check for uploaded files in localStorage
          const uploadedFiles = {}
          Object.keys(localStorage).forEach(fileKey => {
            if (fileKey.includes('uploaded_file_')) {
              const fileData = localStorage.getItem(fileKey)
              if (fileData && fileData.startsWith('data:')) {
                const docType = fileKey.split('_').pop()
                uploadedFiles[docType] = fileData
              }
            }
          })
          
          requests.push({
            userId,
            ...data,
            documents: data.documents || uploadedFiles,
            farmer: farmers.find(f => f.id === userId)
          })
        } catch (error) {
          console.error('Error parsing verification data:', error)
        }
      }
    })
    setVerificationRequests(requests)
  }

  const deleteProduct = async (productId) => {
    if (!confirm('Delete this product?')) return
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
      
      if (error) throw error
      toast.success('Product deleted!')
      fetchProducts()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const approveVerification = (userId) => {
    // Store verification status in localStorage
    localStorage.setItem(`farmer_verified_${userId}`, 'true')
    localStorage.removeItem(`verification_${userId}`)
    
    // Update farmers list
    setFarmers(prev => prev.map(farmer => 
      farmer.id === userId 
        ? { ...farmer, verification_status: 'verified' }
        : farmer
    ))
    
    // Update auth store if this is the current user
    const currentUser = JSON.parse(localStorage.getItem('sb-looacbgrwnnjhtkhaxrz-auth-token') || '{}')
    if (currentUser?.user?.id === userId) {
      // Update profile in auth store
      const profileData = JSON.parse(localStorage.getItem('user_profile') || '{}')
      profileData.verification_status = 'verified'
      localStorage.setItem('user_profile', JSON.stringify(profileData))
    }
    
    toast.success('Farmer verified!')
    fetchVerificationRequests()
  }

  const rejectVerification = (userId) => {
    localStorage.removeItem(`verification_${userId}`)
    toast.success('Verification rejected')
    fetchVerificationRequests()
  }

  const unverifyFarmer = (userId) => {
    if (!confirm('Remove verification status from this farmer?')) return
    
    localStorage.removeItem(`farmer_verified_${userId}`)
    
    // Update farmers list
    setFarmers(prev => prev.map(farmer => 
      farmer.id === userId 
        ? { ...farmer, verification_status: 'unverified' }
        : farmer
    ))
    
    toast.success('Farmer unverified!')
  }

  const isAdmin = localStorage.getItem('admin_session') === 'true'
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Please login as admin first</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('adminDashboard')}</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'products', label: t('products'), icon: Package },
                { id: 'farmers', label: t('farmers'), icon: Users },
                { id: 'verification', label: t('verificationRequests'), icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('allProducts')}</h2>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image_url}
                          alt={product.crop_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-medium">{product.crop_name}</h3>
                          <p className="text-sm text-gray-600">By: {product.profiles?.full_name}</p>
                          <p className="text-sm text-gray-600">₹{product.price}/kg • {product.quantity}kg</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{t('delete')}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'farmers' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{t('allFarmers')}</h2>
                <div className="space-y-4">
                  {farmers.map((farmer) => (
                    <div key={farmer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{farmer.full_name}</h3>
                        <p className="text-sm text-gray-600">Location: {farmer.location || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">Phone: {farmer.phone || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">Email: {farmer.email || 'Not available'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          farmer.verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {farmer.verification_status || 'unverified'}
                        </span>
                        {farmer.verification_status === 'verified' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600 font-medium">✓ {t('adminVerified')}</span>
                            <button
                              onClick={() => unverifyFarmer(farmer.id)}
                              className="text-xs text-red-600 hover:text-red-800 underline"
                            >
                              {t('unverify')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'verification' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Verification Requests</h2>
                <div className="space-y-6">
                  {verificationRequests.map((request) => (
                    <div key={request.userId} className="p-6 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-lg">Farmer ID: {request.userId}</h3>
                          <p className="text-sm text-gray-600">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Status: {request.status}</p>
                          {request.farmerInfo && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-700"><strong>Phone:</strong> {request.farmerInfo.phone}</p>
                              <p className="text-sm text-gray-700"><strong>Location:</strong> {request.farmerInfo.location}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveVerification(request.userId)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                            <span>{t('approve')}</span>
                          </button>
                          <button
                            onClick={() => rejectVerification(request.userId)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                            <span>{t('reject')}</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Documents Section */}
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents:</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {request.documents && Object.entries(request.documents).map(([docType, docPath]) => (
                            <div key={docType} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium capitalize">{docType.replace(/([A-Z])/g, ' $1')}</span>
                                <button
                                  onClick={() => window.open(docPath, '_blank')}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View</span>
                                </button>
                              </div>
                              <div className="bg-gray-100 rounded p-2">
                                <div className="text-center text-gray-700 text-sm py-4">
                                  📄 {docType.charAt(0).toUpperCase() + docType.slice(1)} Document
                                  <br />
                                  <button 
                                    onClick={() => {
                                      if (docPath.startsWith('data:')) {
                                        // Base64 data - open in new window
                                        const newWindow = window.open()
                                        newWindow.document.write(`<img src="${docPath}" style="max-width:100%;height:auto;" />`)
                                      } else if (docPath.startsWith('http')) {
                                        // URL - open directly
                                        window.open(docPath, '_blank')
                                      } else {
                                        // Supabase storage path
                                        const fullUrl = `https://looacbgrwnnjhtkhaxrz.supabase.co/storage/v1/object/public/product-images/verification/${docPath}`
                                        window.open(fullUrl, '_blank')
                                      }
                                    }}
                                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                  >
                                    View Document
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {(!request.documents || Object.keys(request.documents).length === 0) && (
                          <p className="text-gray-500 text-sm">No documents uploaded</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {verificationRequests.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending verification requests</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}