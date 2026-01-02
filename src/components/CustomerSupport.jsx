import { Phone, Mail, MessageCircle } from 'lucide-react'

export default function CustomerSupport() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-4 max-w-xs">
        <h4 className="font-medium text-gray-900 mb-3">Customer Support</h4>
        <div className="space-y-2">
          <a
            href="tel:9902279352"
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Phone className="h-4 w-4" />
            <span>9902279352</span>
          </a>
          <a
            href="mailto:lokeshchapate725@gmail.com"
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Mail className="h-4 w-4" />
            <span>lokeshchapate725@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  )
}