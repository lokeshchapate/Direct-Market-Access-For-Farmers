// Fetch commodity prices from Karnataka government website
export const fetchKarnatakaPrices = async () => {
  try {
    // Using CORS proxy to fetch data
    const proxyUrl = 'https://api.allorigins.win/raw?url='
    const targetUrl = 'https://krama.karnataka.gov.in/'
    
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl))
    const html = await response.text()
    
    // Parse HTML to extract commodity prices
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Extract price data from the table
    const priceData = extractPriceData(doc)
    
    return priceData
  } catch (error) {
    console.error('Failed to fetch Karnataka prices:', error)
    return getMockKarnatakaPrices()
  }
}

const extractPriceData = (doc) => {
  const prices = []
  
  // Find the commodity prices table
  const tables = doc.querySelectorAll('table')
  
  tables.forEach(table => {
    const rows = table.querySelectorAll('tr')
    
    rows.forEach((row, index) => {
      if (index === 0) return // Skip header
      
      const cells = row.querySelectorAll('td')
      if (cells.length >= 2) {
        const commodity = cells[0]?.textContent?.trim()
        const price = cells[1]?.textContent?.trim()
        
        if (commodity && price) {
          prices.push({
            commodity,
            price: parseFloat(price.replace(/[^\d.]/g, '')) || 0,
            unit: 'kg',
            date: new Date().toLocaleDateString()
          })
        }
      }
    })
  })
  
  return prices.length > 0 ? prices : getMockKarnatakaPrices()
}

// Mock data as fallback
const getMockKarnatakaPrices = () => [
  // Vegetables
  { commodity: 'Tomato', price: 45, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Onion', price: 32, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Potato', price: 25, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Cabbage', price: 22, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Carrot', price: 35, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Beans', price: 48, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Brinjal', price: 30, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Cauliflower', price: 28, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Green Chilli', price: 55, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Coriander', price: 45, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Cucumber', price: 18, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Capsicum', price: 60, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Beetroot', price: 26, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Radish', price: 20, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Spinach', price: 15, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Okra (Bhindi)', price: 42, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Pumpkin', price: 18, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Bottle Gourd', price: 22, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Ridge Gourd', price: 28, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Bitter Gourd', price: 35, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Drumstick', price: 48, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Ginger', price: 125, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Garlic', price: 95, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Mint', price: 38, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Curry Leaves', price: 52, unit: 'kg', date: new Date().toLocaleDateString() },
  
  // Fruits
  { commodity: 'Banana', price: 35, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Apple', price: 120, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Orange', price: 45, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Grapes', price: 85, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Mango', price: 65, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Papaya', price: 28, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Watermelon', price: 15, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Muskmelon', price: 22, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Pomegranate', price: 150, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Guava', price: 38, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Pineapple', price: 42, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Sapota (Chikoo)', price: 55, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Sweet Lime', price: 48, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Lemon', price: 65, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Custard Apple', price: 75, unit: 'kg', date: new Date().toLocaleDateString() },
  
  // Grains & Pulses
  { commodity: 'Rice', price: 38, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Wheat', price: 28, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Jowar', price: 25, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Bajra', price: 26, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Ragi', price: 32, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Tur Dal', price: 95, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Moong Dal', price: 85, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Chana Dal', price: 65, unit: 'kg', date: new Date().toLocaleDateString() },
  
  // Others
  { commodity: 'Sugar', price: 42, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Jaggery', price: 55, unit: 'kg', date: new Date().toLocaleDateString() },
  { commodity: 'Coconut', price: 35, unit: 'piece', date: new Date().toLocaleDateString() }
]
