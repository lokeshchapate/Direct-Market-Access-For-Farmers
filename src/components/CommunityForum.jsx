import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ThumbsUp, Share2, Plus, Search, Filter, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function CommunityForum() {
  const { user, profile } = useAuthStore()
  const { t } = useLanguageStore()
  const [posts, setPosts] = useState([])
  const [showNewPost, setShowNewPost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'tips' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedPost, setExpandedPost] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState({})

  const categories = [
    { id: 'all', name: t('allPosts'), icon: '📋' },
    { id: 'tips', name: t('farmingTips'), icon: '💡' },
    { id: 'market', name: t('marketInfo'), icon: '📈' },
    { id: 'weather', name: t('weatherUpdates'), icon: '🌤️' },
    { id: 'equipment', name: t('equipment'), icon: '🚜' },
    { id: 'help', name: t('helpSupport'), icon: '🤝' }
  ]

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = () => {
    // Mock community posts
    const mockPosts = [
      {
        id: 1,
        title: 'Best practices for tomato cultivation in monsoon',
        content: 'During monsoon season, it\'s crucial to ensure proper drainage for tomato plants. Here are some tips that have worked well for me...',
        author: 'Rajesh Kumar',
        location: 'Karnataka',
        category: 'tips',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 5,
        comments: 2,
        liked: false
      },
      {
        id: 2,
        title: 'Onion prices surge in Bangalore market',
        content: 'Onion prices have increased by 30% this week due to supply shortage. Farmers with good quality onions can get better rates.',
        author: 'Priya Sharma',
        location: 'Karnataka',
        category: 'market',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        comments: 1,
        liked: true
      },
      {
        id: 3,
        title: 'Looking for recommendations on organic fertilizers',
        content: 'I want to switch to organic farming. Can anyone recommend good organic fertilizers that have worked well for vegetable crops?',
        author: 'Amit Patel',
        location: 'Gujarat',
        category: 'help',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 3,
        comments: 0,
        liked: false
      },
      {
        id: 4,
        title: 'Heavy rain alert for next 3 days',
        content: 'Weather department has issued heavy rain warning. Farmers should take necessary precautions to protect their crops.',
        author: 'Weather Bot',
        location: 'India',
        category: 'weather',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        comments: 0,
        liked: false
      }
    ]

    setPosts(mockPosts)
    
    // Mock comments
    setComments({
      1: [
        { id: 1, author: 'Suresh Reddy', content: 'Great tips! I\'ve been following similar practices.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
        { id: 2, author: 'Meera Singh', content: 'Thanks for sharing. Very helpful for new farmers.', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() }
      ],
      2: [
        { id: 3, author: 'Ravi Kumar', content: 'Confirmed! Prices are high in Chennai market too.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
      ]
    })
  }

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error(t('pleaseFillAllFields'))
      return
    }

    const post = {
      id: Date.now(),
      ...newPost,
      author: profile?.full_name || 'Anonymous',
      location: profile?.location || 'Unknown',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      liked: false
    }

    setPosts(prev => [post, ...prev])
    setNewPost({ title: '', content: '', category: 'tips' })
    setShowNewPost(false)
    toast.success(t('postCreatedSuccessfully'))
  }

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1
          }
        : post
    ))
  }

  const sharePost = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.content,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${post.title}\n\n${post.content}`)
      toast.success(t('postCopiedToClipboard'))
    }
  }

  const toggleComments = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId)
    setNewComment('')
  }

  const addComment = (postId) => {
    if (!newComment.trim()) {
      toast.error(t('pleaseEnterComment'))
      return
    }

    const comment = {
      id: Date.now(),
      author: profile?.full_name || 'Anonymous',
      content: newComment,
      timestamp: new Date().toISOString()
    }

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment]
    }))

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ))

    setNewComment('')
    toast.success(t('commentAdded'))
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('justNow')
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('communityForum')}</h2>
          <p className="text-gray-600">{t('connectWithFarmers')}</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('newPost')}</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-full">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchPosts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6 border max-w-full"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('createNewPost')}</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('postTitle')}
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={newPost.category}
              onChange={(e) => setNewPost({...newPost, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              {categories.filter(c => c.id !== 'all').map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            <textarea
              placeholder={t('shareThoughts')}
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex space-x-3">
              <button onClick={createPost} className="btn-primary">
                {t('post')}
              </button>
              <button 
                onClick={() => setShowNewPost(false)}
                className="btn-secondary"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6 border hover:shadow-md transition-shadow max-w-full overflow-hidden"
          >
            {/* Post Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{post.author}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{post.location}</span>
                    <span>•</span>
                    <span>{getTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {categories.find(c => c.id === post.category)?.icon} {categories.find(c => c.id === post.category)?.name}
              </span>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2 break-words">{post.title}</h3>
              <p className="text-gray-700 break-words">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.liked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
              <button
                onClick={() => sharePost(post)}
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
              >
                <Share2 className="h-4 w-4" />
                <span className="text-sm">{t('share')}</span>
              </button>
            </div>

            {/* Comments Section */}
            {expandedPost === post.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t"
              >
                <h4 className="font-medium text-gray-900 mb-3">{t('comments')}</h4>
                
                {/* Existing Comments */}
                <div className="space-y-3 mb-4">
                  {(comments[post.id] || []).map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{getTimeAgo(comment.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  
                  {(!comments[post.id] || comments[post.id].length === 0) && (
                    <p className="text-sm text-gray-500 italic">{t('noCommentsYet')}</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={t('writeComment')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                  <button
                    onClick={() => addComment(post.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  >
                    {t('post')}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('noPostsFound')}</p>
        </div>
      )}
    </div>
  )
}