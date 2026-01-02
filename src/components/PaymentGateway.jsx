import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Building, Wallet, Shield, X } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'
import toast from 'react-hot-toast'

export default function PaymentGateway({ order, onSuccess, onClose }) {
  const { t } = useLanguageStore()
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [processing, setProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })

  const paymentMethods = [
    { id: 'upi', name: t('upi'), icon: Smartphone, description: t('payUsingUPI') },
    { id: 'card', name: t('creditDebitCard'), icon: CreditCard, description: t('visaMastercardRupay') },
    { id: 'netbanking', name: t('netBanking'), icon: Building, description: t('allMajorBanks') },
    { id: 'wallet', name: t('digitalWallet'), icon: Wallet, description: t('paytmPhonePeGPay') },
    { id: 'cod', name: t('cashOnDelivery'), icon: Shield, description: t('payWhenReceive') }
  ]

  const handlePayment = async () => {
    setProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (selectedMethod === 'cod') {
        onSuccess('cod')
        toast.success(t('orderPlacedPayOnDelivery'))
      } else {
        // Simulate payment gateway response
        const success = Math.random() > 0.1 // 90% success rate
        
        if (success) {
          onSuccess(selectedMethod)
          toast.success(t('paymentSuccessful'))
        } else {
          throw new Error(t('paymentFailed'))
        }
      }
    } catch (error) {
      toast.error(t('paymentFailedTryAgain'))
    } finally {
      setProcessing(false)
    }
  }

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'upi':
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('enterUPIID')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex space-x-2">
              <img src="/paytm-logo.png" alt="Paytm" className="h-8 w-12 object-contain bg-gray-100 rounded" />
              <img src="/phonepe-logo.png" alt="PhonePe" className="h-8 w-12 object-contain bg-gray-100 rounded" />
              <img src="/gpay-logo.png" alt="GPay" className="h-8 w-12 object-contain bg-gray-100 rounded" />
            </div>
          </div>
        )
      
      case 'card':
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder={t('cardNumber')}
              value={cardDetails.number}
              onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <input
              type="text"
              placeholder={t('cardholderName')}
              value={cardDetails.name}
              onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )
      
      case 'netbanking':
        return (
          <div className="space-y-3">
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option>{t('selectYourBank')}</option>
              <option>{t('stateBankOfIndia')}</option>
              <option>{t('hdfcBank')}</option>
              <option>{t('iciciBank')}</option>
              <option>{t('axisBank')}</option>
              <option>{t('punjabNationalBank')}</option>
              <option>{t('bankOfBaroda')}</option>
            </select>
          </div>
        )
      
      case 'wallet':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <button className="p-3 border border-gray-300 rounded-lg hover:border-primary-500">
                <img src="/paytm-logo.png" alt="Paytm" className="h-8 mx-auto" />
                <p className="text-xs mt-1">{t('paytm')}</p>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:border-primary-500">
                <img src="/phonepe-logo.png" alt="PhonePe" className="h-8 mx-auto" />
                <p className="text-xs mt-1">{t('phonePe')}</p>
              </button>
              <button className="p-3 border border-gray-300 rounded-lg hover:border-primary-500">
                <img src="/gpay-logo.png" alt="GPay" className="h-8 mx-auto" />
                <p className="text-xs mt-1">{t('googlePay')}</p>
              </button>
            </div>
          </div>
        )
      
      case 'cod':
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-900">{t('cashOnDelivery')}</p>
                <p className="text-xs text-yellow-700">{t('pay')} ₹{order.total} {t('payWhenReceive').toLowerCase()}</p>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{t('completePayment')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Order Summary */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">{t('orderSummary')}</h4>
            <div className="space-y-1 text-sm">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.crop_name} ({item.quantity}kg)</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-1 flex justify-between font-medium">
                <span>{t('total')}</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3">{t('selectPaymentMethod')}</h4>
            <div className="space-y-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-3 border rounded-lg text-left flex items-center space-x-3 ${
                      selectedMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-xs text-gray-600">{method.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Payment Form */}
          <div className="mb-6">
            {renderPaymentForm()}
          </div>



          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={processing}
            >
              {t('cancel')}
            </button>
            <button
              onClick={handlePayment}
              disabled={processing}
              className="flex-1 btn-primary"
            >
              {processing ? t('processing') : `${t('pay')} ₹${order.total}`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}