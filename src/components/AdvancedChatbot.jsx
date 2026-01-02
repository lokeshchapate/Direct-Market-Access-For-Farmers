import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Bot, User, Lightbulb, TrendingUp, Cloud } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AdvancedChatbot({ role = 'farmer' }) {
  const { profile } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const knowledgeBase = {
    platform: {
      'dashboard': 'Your dashboard has 10 tabs: Products, Orders, Community, Market Prices, Weather, Analytics, Demand Forecast, AI Recommendations, Government Schemes, and Logistics.',
      'add product': 'Click the "Add Product" button in the Products tab to list your crops. Fill in crop name, price, quantity, and description.',
      'view orders': 'Check the Orders tab to see all buyer orders. You can accept, reject, or mark orders as shipped.',
      'market prices': 'The Market Prices tab shows real-time crop prices from different markets to help you set competitive prices.',
      'weather': 'Weather tab provides 7-day forecasts and farming tips based on weather conditions.',
      'analytics': 'Analytics tab shows sales reports, revenue trends, and performance insights. You can also generate downloadable reports.',
      'community': 'Community tab lets you connect with other farmers, share tips, ask questions, and get farming advice.',
      'government schemes': 'Government Schemes tab shows available schemes like PM-KISAN, PMFBY, KCC with direct application links.',
      'logistics': 'Logistics tab tracks your shipped orders with real-time delivery status and driver contact information.',
      'notifications': 'Click the bell icon in the top navigation to see order alerts, price updates, and weather warnings.',
      'profile': 'Your profile shows in the top navigation. Update your details for better buyer trust.',
      'language': 'Change language using the language selector in the top navigation bar.'
    },
    farming: {
      'crop diseases': 'Common crop diseases include blight, rust, and powdery mildew. Use organic fungicides and ensure proper spacing.',
      'irrigation': 'Drip irrigation saves 30-50% water. Water early morning or evening to reduce evaporation.',
      'fertilizer': 'Use NPK ratio 4:2:1 for vegetables. Organic compost improves soil health long-term.',
      'pest control': 'Neem oil is effective against aphids. Companion planting with marigolds deters pests naturally.',
      'organic farming': 'Organic farming uses natural fertilizers like compost, avoids synthetic pesticides, and focuses on soil health.',
      'crop rotation': 'Rotate crops to prevent soil depletion. Follow legumes with cereals, then vegetables.',
      'soil health': 'Test soil pH regularly. Most crops prefer 6.0-7.0 pH. Add lime to increase pH, sulfur to decrease.',
      'seeds': 'Use certified seeds for better yield. Hybrid seeds give higher production but cannot be saved for next season.'
    },
    market: {
      'price trends': 'Check the Market Prices tab for real-time rates. Tomato prices typically peak in winter.',
      'demand forecast': 'Use the Demand Forecast tab to see which crops will be in high demand. Organic produce demand growing 20% annually.',
      'export opportunities': 'Basmati rice, spices, and organic products have strong export potential.',
      'direct selling': 'Sell directly to consumers through farmers markets, online platforms, or farm-to-table restaurants.',
      'value addition': 'Process raw produce into pickles, dried fruits, or packaged goods to increase profit margins.'
    },
    weather: {
      'monsoon': 'Check Weather tab for monsoon updates. Plant kharif crops by June for optimal yield.',
      'drought': 'Weather tab shows drought alerts. Drought-resistant crops: millets, sorghum, groundnut.',
      'temperature': 'Weather widget shows daily temperatures. Most vegetables grow best at 20-25°C.',
      'climate change': 'Adapt to climate change with drought-resistant varieties, water conservation, and diversified cropping.'
    },
    government: {
      'schemes': 'Visit Government Schemes tab to apply for PM-KISAN (₹6000/year), PMFBY crop insurance, and KCC loans.',
      'subsidies': 'Government Schemes tab shows fertilizer subsidy (up to 50%) and irrigation subsidies through PMKSY.',
      'loans': 'Apply for Kisan Credit Card through Government Schemes tab - offers loans up to ₹3 lakh without collateral.',
      'insurance': 'PMFBY provides crop insurance against natural disasters. Premium is subsidized by government.'
    },
    general: {
      'technology': 'Modern farming uses GPS, drones, IoT sensors, and mobile apps for precision agriculture.',
      'education': 'Continuous learning through agricultural extension services, online courses, and farmer training programs.',
      'business': 'Treat farming as a business - maintain records, calculate costs, analyze profits, and plan investments.',
      'health': 'Use protective equipment when handling chemicals. Maintain clean water sources and practice food safety.',
      'environment': 'Sustainable farming protects environment through reduced chemical use, water conservation, and biodiversity.',
      'finance': 'Maintain farm accounts, separate business and personal expenses, and plan for seasonal cash flows.',
      'marketing': 'Build brand reputation, use social media, get certifications, and maintain quality standards.',
      'innovation': 'Stay updated with new farming techniques, crop varieties, and agricultural technologies.'
    },
    science: {
      'photosynthesis': 'Plants convert sunlight, CO2, and water into glucose and oxygen. Adequate light is crucial for growth.',
      'nutrition': 'Plants need macronutrients (NPK) and micronutrients (iron, zinc, boron) for healthy growth.',
      'genetics': 'Plant breeding develops varieties with desired traits like disease resistance and higher yield.',
      'biology': 'Understanding plant biology helps in better crop management and problem diagnosis.'
    }
  }

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        content: role === 'buyer' 
          ? `Hi! I'm your AI shopping assistant. Ask me about finding products, quality checking, ordering, payments, or general questions.`
          : `Hi! I'm your AI farming assistant. Ask me about crops, selling, weather, market prices, or general farming questions.`,
        timestamp: new Date(),
        suggestions: role === 'buyer' 
          ? ['How to buy?', 'Quality check', 'Payment methods', 'Order tracking']
          : ['How to sell?', 'Market prices', 'Weather info', 'Crop advice']
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getGeneralKnowledgeResponse = (input) => {
    const topics = {
      'what is the sun': 'The Sun is a star at the center of our solar system. It provides light and heat energy essential for life on Earth, including photosynthesis in plants.',
      'what is water': 'Water (H2O) is essential for all life. In farming, proper water management through irrigation is crucial for crop growth.',
      'what is air': 'Air contains oxygen, nitrogen, and carbon dioxide. Plants use CO2 for photosynthesis and release oxygen.',
      'what is earth': 'Earth is our planet with diverse climates and soil types, making different agricultural practices possible worldwide.',
      'who invented': 'Many inventions have shaped agriculture - from the plow to modern tractors and GPS farming technology.',
      'when was': 'Historical dates vary by topic. Agricultural history spans thousands of years of human development.',
      'where is': 'Geographic locations have different climates and farming conditions. Each region has unique agricultural advantages.',
      'why do': 'Natural processes often have scientific explanations. In farming, understanding "why" helps improve practices.',
      'how does': 'Processes work through various mechanisms. In agriculture, understanding how things work improves efficiency.'
    }

    for (const [key, response] of Object.entries(topics)) {
      if (input.includes(key)) {
        return {
          content: response,
          category: 'general',
          suggestions: ['More science', 'Farming science', 'Ask another', 'Platform help']
        }
      }
    }

    return {
      content: 'That\'s an interesting question! While I can discuss many topics, I specialize in farming, business, and technology. I can relate most topics to agriculture if that helps. What specific aspect interests you?',
      category: 'general',
      suggestions: ['Relate to farming', 'Science topics', 'Ask differently', 'Platform help']
    }
  }

  const generateResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    // Check knowledge base
    for (const [category, topics] of Object.entries(knowledgeBase)) {
      for (const [topic, response] of Object.entries(topics)) {
        if (input.includes(topic) || input.includes(category)) {
          return {
            content: response,
            category,
            suggestions: getRelatedSuggestions(category)
          }
        }
      }
    }

    // Detailed farming responses
    if (input.includes('organic farming') || input.includes('organic')) {
      return {
        content: 'Organic farming avoids synthetic pesticides and fertilizers. Benefits: 1) Higher market prices (20-30% premium), 2) Better soil health, 3) Environmental protection, 4) Growing consumer demand. Start with: Compost preparation, natural pest control (neem, companion planting), crop rotation, and organic certification process.',
        category: 'farming',
        suggestions: ['Organic certification', 'Natural pesticides', 'Compost making', 'Premium pricing']
      }
    }

    if (input.includes('crop rotation') || input.includes('rotation')) {
      return {
        content: 'Crop rotation prevents soil depletion and pest buildup. Effective rotation: Year 1: Legumes (beans, peas) - fix nitrogen, Year 2: Leafy greens (spinach, lettuce) - use nitrogen, Year 3: Root crops (carrots, radish) - break soil, Year 4: Cereals (wheat, rice) - restore structure. This increases yield by 10-25% and reduces fertilizer costs.',
        category: 'farming',
        suggestions: ['Soil health', 'Nitrogen fixing', 'Pest management', 'Yield improvement']
      }
    }

    if (input.includes('irrigation') || input.includes('water management')) {
      return {
        content: 'Efficient irrigation saves water and increases yield. Drip irrigation: 30-50% water savings, delivers water directly to roots, reduces disease. Installation cost: ₹25,000-40,000/acre, recovers in 2-3 seasons. Best for: Vegetables, fruits, cash crops. Water early morning (6-8 AM) or evening (6-8 PM) to reduce evaporation.',
        category: 'farming',
        suggestions: ['Drip irrigation setup', 'Water scheduling', 'Cost analysis', 'Crop selection']
      }
    }

    if (input.includes('pest control') || input.includes('pesticide') || input.includes('insects')) {
      return {
        content: 'Integrated Pest Management (IPM): 1) Prevention: Healthy soil, resistant varieties, 2) Biological: Neem oil, beneficial insects, companion planting, 3) Mechanical: Traps, barriers, 4) Chemical: Only as last resort. Neem oil recipe: 2ml neem oil + 1ml liquid soap per liter water. Spray early morning or evening.',
        category: 'farming',
        suggestions: ['Neem oil preparation', 'Beneficial insects', 'Companion planting', 'Organic pesticides']
      }
    }

    if (input.includes('fertilizer') || input.includes('nutrients') || input.includes('npk')) {
      return {
        content: 'Plant nutrition basics: NPK ratio for vegetables (4:2:1), fruits (3:1:2), cereals (3:1:1). Organic options: Compost (slow release), vermicompost (rich in micronutrients), green manure (nitrogen fixing). Application: Base dose before planting, top dressing during growth. Soil testing every 2-3 years helps optimize fertilizer use.',
        category: 'farming',
        suggestions: ['Soil testing', 'Compost making', 'Nutrient deficiency', 'Organic fertilizers']
      }
    }

    // Role-specific responses
    if (role === 'buyer') {
      // Buyer-specific responses
      if (input.includes('how to buy') || input.includes('purchase') || input.includes('buying process')) {
        return {
          content: 'Buying process: 1) Browse products in "Browse Products" tab, 2) Use search/filters to find specific crops, 3) Click product for detailed view with reviews, 4) Select quantity and add to cart, 5) Review cart and proceed to payment, 6) Choose Cash on Delivery or online payment, 7) Track order status in "My Orders" tab.',
          category: 'platform',
          suggestions: ['Product search', 'Payment methods', 'Order tracking', 'Review system']
        }
      }
      
      if (input.includes('fresh') || input.includes('quality') || input.includes('organic')) {
        return {
          content: 'Quality tips for buyers: 1) Check harvest date (fresher is better), 2) Read farmer reviews and ratings, 3) Look for organic certification badges, 4) Check product photos carefully, 5) Contact farmer for questions, 6) Start with small orders from new farmers.',
          category: 'platform',
          suggestions: ['Farmer ratings', 'Organic certification', 'Product reviews', 'Quality indicators']
        }
      }
    } else {
      // Farmer-specific responses
      if (input.includes('sell') || input.includes('selling') || input.includes('customers')) {
        return {
          content: 'Selling tips for farmers: 1) Upload high-quality product photos, 2) Write detailed descriptions, 3) Set competitive prices, 4) Maintain good ratings, 5) Respond quickly to orders, 6) Ensure product quality, 7) Build customer relationships.',
          category: 'platform',
          suggestions: ['Product photography', 'Pricing strategy', 'Customer service', 'Quality control']
        }
      }
    }

    if (input.includes('quality') || input.includes('fresh') || input.includes('how to check')) {
      return {
        content: 'Ensuring quality: 1) Check harvest date (fresher is better), 2) Read product reviews and ratings, 3) Verify farmer profile and ratings, 4) Look for organic certification if needed, 5) Check product photos, 6) Contact farmer through platform if questions. Fresh vegetables: harvest within 2-3 days, fruits: proper ripeness indicators.',
        category: 'platform',
        suggestions: ['Farmer verification', 'Review system', 'Organic certification', 'Freshness indicators']
      }
    }

    if (input.includes('payment') || input.includes('cod') || input.includes('cash on delivery')) {
      return {
        content: 'Payment options: 1) Cash on Delivery (COD) - Pay when product arrives, no advance payment, 2) Online payment - Secure payment gateway, immediate confirmation, 3) Digital wallets - Quick and convenient. COD is recommended for first-time buyers. All payments are secure and buyer-protected.',
        category: 'platform',
        suggestions: ['COD benefits', 'Online payment security', 'Refund policy', 'Payment issues']
      }
    }

    if (input.includes('delivery') || input.includes('shipping') || input.includes('logistics')) {
      return {
        content: 'Delivery process: 1) Order confirmation within 2 hours, 2) Farmer prepares and packs order, 3) Pickup by delivery partner, 4) Real-time tracking available, 5) Delivery within 24-48 hours for local, 2-5 days for distant locations. Track orders in "My Orders" tab. Contact support for delivery issues.',
        category: 'platform',
        suggestions: ['Order tracking', 'Delivery time', 'Packaging quality', 'Delivery issues']
      }
    }

    // Platform-specific responses
    if (input.includes('how to add product') || input.includes('add product')) {
      return {
        content: 'Adding products (Farmers): 1) Go to "My Products" tab, 2) Click "Add Product" button, 3) Fill details: Crop name, price per kg, available quantity, harvest date, description, 4) Upload clear product photos, 5) Click "Save Product". Tips: Competitive pricing, detailed description, high-quality photos increase sales.',
        category: 'platform',
        suggestions: ['Product photography', 'Competitive pricing', 'Product description', 'Inventory management']
      }
    }

    if (input.includes('orders') || input.includes('manage orders')) {
      return {
        content: 'Order management (Farmers): 1) Check "Orders" tab regularly, 2) Accept orders within 2 hours for better ratings, 3) Prepare products carefully, 4) Mark as "Shipped" when dispatched, 5) Communicate with buyers if issues. Buyers: Track orders in "My Orders", cancel if needed, rate after delivery.',
        category: 'platform',
        suggestions: ['Order acceptance', 'Communication tips', 'Rating system', 'Order cancellation']
      }
    }

    // Detailed market and pricing responses
    if (input.includes('price') || input.includes('pricing strategy') || input.includes('sell')) {
      return {
        content: 'Pricing strategy: 1) Check Market Prices tab for current APMC rates, 2) Consider quality premium (organic +20-30%, premium quality +10-15%), 3) Factor in costs: production, packaging, transport, 4) Competitive analysis: check similar products, 5) Seasonal pricing: higher during off-season. Direct selling eliminates middleman margin (15-25% extra profit).',
        category: 'market',
        suggestions: ['APMC rates', 'Quality premium', 'Cost calculation', 'Seasonal trends']
      }
    }

    if (input.includes('profit') || input.includes('income') || input.includes('earnings')) {
      return {
        content: 'Profit calculation: Revenue - (Production costs + Marketing costs + Transport). Increase profit by: 1) Direct selling (save 15-25% middleman margin), 2) Value addition (processing, packaging), 3) Organic certification (+20-30% price), 4) Bulk sales to restaurants/retailers, 5) Seasonal planning for better prices.',
        category: 'market',
        suggestions: ['Cost analysis', 'Value addition', 'Direct selling benefits', 'Bulk sales']
      }
    }

    if (input.includes('marketing') || input.includes('promote') || input.includes('customers')) {
      return {
        content: 'Marketing strategies: 1) High-quality product photos, 2) Detailed product descriptions, 3) Competitive pricing, 4) Maintain good ratings and reviews, 5) Regular product updates, 6) Seasonal crop planning, 7) Build customer relationships through quality and service. Social media and word-of-mouth are powerful for farmers.',
        category: 'market',
        suggestions: ['Product photography', 'Customer reviews', 'Social media', 'Quality maintenance']
      }
    }

    if (input.includes('weather') || input.includes('rain')) {
      return {
        content: 'Go to the Weather tab for 7-day forecasts and farming tips. The weather widget shows temperature, humidity, and rainfall predictions.',
        category: 'weather',
        suggestions: ['Weather tab', 'Farming tips', 'Irrigation planning']
      }
    }

    if (input.includes('government') || input.includes('scheme')) {
      return {
        content: 'Visit the Government Schemes tab to see PM-KISAN, PMFBY, and KCC schemes. You can apply directly through the provided links.',
        category: 'government',
        suggestions: ['Government Schemes tab', 'PM-KISAN application', 'Subsidy eligibility']
      }
    }

    // General knowledge responses
    if (input.includes('what is') || input.includes('define') || input.includes('explain')) {
      return {
        content: 'I can explain concepts related to agriculture, technology, business, science, or general topics. What specific term or concept would you like me to explain?',
        category: 'general',
        suggestions: ['Technology terms', 'Scientific concepts', 'Business definitions', 'Agricultural terms']
      }
    }

    if (input.includes('how to') || input.includes('tutorial') || input.includes('guide')) {
      return {
        content: 'I can provide step-by-step guidance on farming techniques, business processes, technology usage, or general procedures. What do you need help with?',
        category: 'general',
        suggestions: ['Farming techniques', 'Business processes', 'Technology help', 'Problem solving']
      }
    }

    if (input.includes('technology') || input.includes('digital') || input.includes('app') || input.includes('internet')) {
      return {
        content: 'Modern agriculture uses technology like GPS, drones, IoT sensors, and mobile apps. This platform itself is a digital solution connecting farmers with buyers directly.',
        category: 'general',
        suggestions: ['Precision agriculture', 'Farm apps', 'Digital marketing', 'Online selling']
      }
    }

    if (input.includes('business') || input.includes('profit') || input.includes('money') || input.includes('finance')) {
      return {
        content: 'Successful farming requires business skills: cost calculation, profit analysis, market research, and financial planning. Treat your farm as a business enterprise.',
        category: 'general',
        suggestions: ['Cost calculation', 'Profit planning', 'Market research', 'Financial management']
      }
    }

    if (input.includes('health') || input.includes('safety') || input.includes('organic') || input.includes('chemical')) {
      return {
        content: 'Farm safety is crucial - use protective equipment, handle chemicals safely, maintain clean water sources, and follow organic practices when possible.',
        category: 'general',
        suggestions: ['Safety equipment', 'Organic methods', 'Chemical handling', 'Health practices']
      }
    }

    if (input.includes('education') || input.includes('learn') || input.includes('training') || input.includes('course')) {
      return {
        content: 'Continuous learning is key to farming success. Use agricultural extension services, online courses, farmer training programs, and community knowledge sharing.',
        category: 'general',
        suggestions: ['Online courses', 'Extension services', 'Training programs', 'Skill development']
      }
    }

    if (input.includes('environment') || input.includes('climate') || input.includes('sustainable') || input.includes('green')) {
      return {
        content: 'Sustainable farming protects the environment through reduced chemical use, water conservation, soil health maintenance, and biodiversity preservation.',
        category: 'general',
        suggestions: ['Water conservation', 'Soil health', 'Biodiversity', 'Climate adaptation']
      }
    }

    // Science and technical questions
    if (input.includes('science') || input.includes('research') || input.includes('study') || input.includes('experiment')) {
      return {
        content: 'Agricultural science covers plant biology, soil science, genetics, nutrition, and environmental factors. Research helps develop better farming methods.',
        category: 'science',
        suggestions: ['Plant biology', 'Soil science', 'Crop genetics', 'Research methods']
      }
    }

    // General knowledge and common questions
    if (input.includes('what') || input.includes('who') || input.includes('when') || input.includes('where') || input.includes('why')) {
      return getGeneralKnowledgeResponse(input)
    }

    if (input.includes('time') || input.includes('date') || input.includes('today')) {
      return {
        content: `Today is ${new Date().toLocaleDateString()} and the current time is ${new Date().toLocaleTimeString()}. How can I help you today?`,
        category: 'general',
        suggestions: ['Weather today', 'Market updates', 'Farming tips', 'Platform help']
      }
    }

    if (input.includes('math') || input.includes('calculate') || /\d+.*[+\-*/].*\d+/.test(input)) {
      return {
        content: 'I can help with basic calculations and math concepts. For complex calculations, I recommend using a calculator app. What math question do you have?',
        category: 'general',
        suggestions: ['Profit calculation', 'Area calculation', 'Cost analysis', 'Percentage help']
      }
    }

    if (input.includes('history') || input.includes('geography') || input.includes('science') || input.includes('physics') || input.includes('chemistry')) {
      return {
        content: 'I can discuss various academic topics! Whether it\'s history, geography, science, or other subjects, I\'m here to help. What specific topic interests you?',
        category: 'general',
        suggestions: ['Agricultural history', 'Soil chemistry', 'Plant biology', 'Geography of farming']
      }
    }

    if (input.includes('news') || input.includes('current events') || input.includes('politics')) {
      return {
        content: 'I focus on helping with farming and business topics rather than current news. However, I can discuss agricultural policies, farming trends, and market developments. What would you like to know?',
        category: 'general',
        suggestions: ['Agricultural policies', 'Market trends', 'Farming innovations', 'Government schemes']
      }
    }

    if (input.includes('food') || input.includes('recipe') || input.includes('cooking') || input.includes('nutrition')) {
      return {
        content: 'I can discuss nutrition, food safety, and the connection between farming and food! While I don\'t have specific recipes, I can talk about crop nutrition, food processing, and healthy eating.',
        category: 'general',
        suggestions: ['Crop nutrition', 'Food safety', 'Organic benefits', 'Processing methods']
      }
    }

    if (input.includes('travel') || input.includes('places') || input.includes('country') || input.includes('city')) {
      return {
        content: 'I can discuss different regions and their agricultural practices! Each area has unique farming methods, crops, and challenges. What region or agricultural practice interests you?',
        category: 'general',
        suggestions: ['Regional farming', 'Crop varieties', 'Climate zones', 'Agricultural tourism']
      }
    }

    if (input.includes('sports') || input.includes('entertainment') || input.includes('movie') || input.includes('music')) {
      return {
        content: 'While I focus mainly on farming and business topics, I understand the importance of recreation! Taking breaks and enjoying hobbies helps maintain work-life balance. What farming or business topic can I help with?',
        category: 'general',
        suggestions: ['Work-life balance', 'Farming communities', 'Rural entertainment', 'Agricultural festivals']
      }
    }

    // Default comprehensive response
    return {
      content: 'I\'m your intelligent assistant! I can help with farming, business, technology, science, general knowledge, and much more. What would you like to know or discuss?',
      category: 'general',
      suggestions: ['Ask anything', 'Farming help', 'General questions', 'Platform guide']
    }
  }

  const getRelatedSuggestions = (category) => {
    const suggestions = {
      farming: ['Organic farming', 'Crop rotation', 'Soil health', 'Seed selection'],
      market: ['Price alerts', 'Demand forecast', 'Export markets', 'Direct sales'],
      weather: ['Seasonal planning', 'Water management', 'Climate adaptation', 'Crop calendar'],
      government: ['Loan applications', 'Subsidy eligibility', 'Scheme benefits', 'Documentation'],
      general: ['Technology help', 'Business advice', 'Health & safety', 'Education resources'],
      science: ['Plant biology', 'Soil science', 'Crop genetics', 'Research methods'],
      platform: ['Dashboard features', 'Order management', 'Analytics', 'Community forum']
    }
    return suggestions[category] || suggestions.general
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Faster response with minimal delay
    setTimeout(() => {
      const response = generateResponse(input)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.content,
        timestamp: new Date(),
        category: response.category,
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 300)
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    sendMessage()
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'market': return <TrendingUp className="h-4 w-4" />
      case 'weather': return <Cloud className="h-4 w-4" />
      case 'farming': return <Lightbulb className="h-4 w-4" />
      default: return <Bot className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-medium">AI Farm Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && (
                        <div className="flex-shrink-0">
                          {getCategoryIcon(message.category)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        {message.suggestions && (
                          <div className="mt-2 space-y-1">
                            {message.suggestions.slice(0, 2).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1">
                  {(role === 'buyer' 
                    ? ['Find Products', 'Quality Tips', 'Payment Help', 'Order Status']
                    : ['Add Product', 'Check Orders', 'Market Prices', 'Weather']
                  ).map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setInput(action)
                        setTimeout(sendMessage, 100)
                      }}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}