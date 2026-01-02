import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Star, MapPin, Calendar, User, ShoppingCart, Truck, Shield } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import RatingStars from './RatingStars'
import toast from 'react-hot-toast'

export default function ProductDetails({ product, onClose, onAddToCart }) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetchReviews()
  }, [product.id])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setReviews(data)
        return
      }
    } catch (error) {
      console.log('Database unavailable, loading from localStorage')
    }

    // Fallback to localStorage
    const localReviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]')
    setReviews(localReviews)
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return
    }

    try {
      // Try database first
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('buyer_id', user.id)

      if (!error) {
        toast.success('Review deleted successfully!')
        fetchReviews()
        return
      }
    } catch (error) {
      console.log('Database unavailable, deleting from localStorage')
    }

    // Fallback to localStorage
    const localReviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]')
    const updatedReviews = localReviews.filter(review => review.id !== reviewId)
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updatedReviews))
    setReviews(updatedReviews)
    toast.success('Review deleted successfully!')
  }

  const submitReview = async () => {
    if (!user) {
      toast.error('Please login to submit a review')
      return
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setLoading(true)
    try {
      // Store review in localStorage as fallback
      const reviewData = {
        id: Date.now(),
        product_id: product.id,
        buyer_id: user.id,
        rating: parseInt(newReview.rating),
        comment: newReview.comment.trim(),
        created_at: new Date().toISOString(),
        profiles: {
          full_name: user.email || 'Anonymous User'
        }
      }

      // Try database first
      try {
        const { error } = await supabase
          .from('reviews')
          .insert([{
            product_id: product.id,
            buyer_id: user.id,
            rating: parseInt(newReview.rating),
            comment: newReview.comment.trim()
          }])

        if (!error) {
          toast.success('Review submitted successfully!')
          setNewReview({ rating: 5, comment: '' })
          fetchReviews()
          setLoading(false)
          return
        }
      } catch (dbError) {
        console.log('Database unavailable, using local storage')
      }

      // Fallback to localStorage
      const existingReviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`) || '[]')
      existingReviews.unshift(reviewData)
      localStorage.setItem(`reviews_${product.id}`, JSON.stringify(existingReviews))
      
      // Update local state
      setReviews(prev => [reviewData, ...prev])
      
      toast.success('Review submitted successfully!')
      setNewReview({ rating: 5, comment: '' })
    } catch (error) {
      console.error('Review submission failed:', error)
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      toast.error(`Only ${product.quantity}kg available in stock`)
      return
    }
    
    onAddToCart(product, quantity)
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Product Info */}
          <div>
            <img
              src={product.image_url || '/api/placeholder/500/400'}
              alt={product.crop_name}
              className="w-full h-80 object-cover rounded-lg mb-6"
            />
            
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.crop_name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-green-600">₹{product.price}/kg</span>
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={averageRating} />
                    <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Product Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Quantity:</span>
                    <span className="font-medium">{product.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harvest Date:</span>
                    <span className="font-medium">{new Date(product.harvest_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farmer:</span>
                    <span className="font-medium">{product.profiles?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{product.profiles?.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Add to Cart Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Price</div>
                    <div className="text-xl font-bold text-green-600">₹{product.price * quantity}</div>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h3>
              
              {/* Rating Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <RatingStars rating={averageRating} />
                    <div className="text-sm text-gray-600">{reviews.length} reviews</div>
                  </div>
                  <div className="flex-1">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center space-x-2 mb-1">
                        <span className="text-sm w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Write Review */}
              <div className="bg-white border rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Write a Review</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className={`text-2xl hover:text-yellow-300 transition-colors ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Share your experience with this product..."
                    />
                  </div>
                  <button
                    onClick={submitReview}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{review.profiles?.full_name}</span>
                            <RatingStars rating={review.rating} size="sm" />
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {review.buyer_id === user?.id && (
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}