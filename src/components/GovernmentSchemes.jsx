import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, ExternalLink, Calendar, IndianRupee, FileText, CheckCircle, Phone, Globe } from 'lucide-react'
import { useLanguageStore } from '../store/languageStore'


export default function GovernmentSchemes({ farmerProfile }) {
  const { t } = useLanguageStore()
  const [schemes, setSchemes] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGovernmentData()
  }, [])

  const fetchGovernmentData = async () => {
    // Simulate government API integration
    setTimeout(() => {
      const mockSchemes = [
        {
          id: 'pmkisan',
          name: 'PM-KISAN Samman Nidhi',
          description: 'Direct income support to farmers - 17th installment released',
          amount: 6000,
          frequency: 'Annual (₹2000 x 3 installments)',
          eligibility: 'Small & marginal farmers with cultivable land up to 2 hectares',
          status: 'eligible',
          deadline: 'Ongoing',
          documents: ['Aadhaar', 'Land Records', 'Bank Account', 'Mobile Number'],
          applyUrl: 'https://pmkisan.gov.in/RegistrationForm.aspx',
          detailsUrl: 'https://pmkisan.gov.in/'
        },
        {
          id: 'pmfby',
          name: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Comprehensive crop insurance - Kharif 2025 registration open',
          amount: 200000,
          frequency: 'Per Season (Sum Insured up to ₹2 lakh)',
          eligibility: 'All farmers growing notified crops in notified areas',
          status: 'eligible',
          deadline: '2025-07-31 (Kharif season)',
          documents: ['Aadhaar', 'Land Records', 'Sowing Certificate', 'Bank Account'],
          applyUrl: 'https://pmfby.gov.in/farmerRegistration',
          detailsUrl: 'https://pmfby.gov.in/'
        },
        {
          id: 'kcc',
          name: 'Kisan Credit Card (KCC)',
          description: 'Enhanced credit limit - Now up to ₹3 lakh without collateral',
          amount: 300000,
          frequency: 'Credit Limit (4% interest rate for timely repayment)',
          eligibility: 'All farmers including tenant farmers, oral lessees, sharecroppers',
          status: 'eligible',
          deadline: 'Ongoing',
          documents: ['Aadhaar', 'Land Records', 'Bank Account', 'Passport Photo'],
          applyUrl: 'https://pmkisan.gov.in/KCCApplication.aspx',
          detailsUrl: 'https://pmkisan.gov.in/KCCStaticReport.aspx'
        },
        {
          id: 'pm_kusum',
          name: 'PM-KUSUM Yojana',
          description: 'Solar pumps & grid-connected solar power plants',
          amount: 175000,
          frequency: 'One-time subsidy (60% central + 30% state = 90% subsidy)',
          eligibility: 'Individual farmers, FPOs, cooperatives with irrigation source',
          status: 'eligible',
          deadline: '2025-03-31',
          documents: ['Land Records', 'Aadhaar', 'Bank Account', 'Electricity Connection', 'Water Source Certificate'],
          applyUrl: 'https://pmkusum.mnre.gov.in/landing.html',
          detailsUrl: 'https://pmkusum.mnre.gov.in/'
        },
        {
          id: 'formation_fpo',
          name: 'Formation & Promotion of FPOs',
          description: 'Support for Farmer Producer Organizations',
          amount: 1800000,
          frequency: 'One-time grant (₹18 lakh over 3 years)',
          eligibility: 'Groups of 300+ farmers in plains, 100+ in hills/tribal areas',
          status: 'eligible',
          deadline: '2025-12-31',
          documents: ['Group Formation Certificate', 'Member List', 'Bank Account', 'Registration Certificate'],
          applyUrl: 'https://sfac.in/fpo-registration',
          detailsUrl: 'https://sfac.in/'
        },
        {
          id: 'natural_farming',
          name: 'Bharatiya Prakritik Krishi Paddhati (BPKP)',
          description: 'Natural farming promotion - Chemical-free agriculture',
          amount: 15000,
          frequency: 'Per hectare for 3 years (₹12,200 + ₹2,800 incentive)',
          eligibility: 'All farmers willing to adopt natural farming practices',
          status: 'eligible',
          deadline: '2025-06-30',
          documents: ['Land Records', 'Aadhaar', 'Bank Account', 'Training Certificate'],
          applyUrl: 'https://naturalfarming.dac.gov.in/registration',
          detailsUrl: 'https://naturalfarming.dac.gov.in/'
        },
        {
          id: 'digital_agriculture',
          name: 'Digital Agriculture Mission',
          description: 'Technology adoption in farming - AI, IoT, drones',
          amount: 25000,
          frequency: 'Per farmer (50% subsidy on digital tools)',
          eligibility: 'Progressive farmers, FPOs with minimum 2 hectare land',
          status: 'eligible',
          deadline: '2025-09-30',
          documents: ['Aadhaar', 'Land Records', 'Bank Account', 'Technology Adoption Plan'],
          applyUrl: 'https://digitalindia.gov.in/agriculture',
          detailsUrl: 'https://agricoop.nic.in/'
        },
        {
          id: 'climate_resilient',
          name: 'Climate Resilient Agriculture',
          description: 'Adaptation to climate change - Drought/flood resistant varieties',
          amount: 40000,
          frequency: 'Per hectare (₹25,000 + ₹15,000 for equipment)',
          eligibility: 'Farmers in climate vulnerable districts',
          status: 'eligible',
          deadline: '2025-08-15',
          documents: ['Land Records', 'Aadhaar', 'Bank Account', 'Climate Vulnerability Certificate'],
          applyUrl: 'https://nicra-icar.in/registration',
          detailsUrl: 'https://nicra-icar.in/'
        }
      ]

      setSchemes(mockSchemes)
      setLoading(false)
    }, 1000)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible': return 'text-green-600 bg-green-100'
      case 'applied': return 'text-blue-600 bg-blue-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'eligible': return <Award className="h-4 w-4 text-green-600" />
      default: return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Government Schemes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6 border"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900">{t('governmentSchemes')}</h3>
        </div>

        <div className="space-y-4">
          {schemes.map((scheme) => (
            <div key={scheme.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{scheme.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{scheme.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scheme.status)}`}>
                  {t(scheme.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-1">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span>₹{scheme.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{scheme.deadline}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">{t('frequency')}: </span>
                  <span className="font-medium">{scheme.frequency}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('eligibility')}: </span>
                  <span className="font-medium text-xs">{scheme.eligibility}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-1">{t('requiredDocuments')}:</p>
                <div className="flex flex-wrap gap-1">
                  {scheme.documents.map((doc, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                {scheme.status === 'eligible' && (
                  <a 
                    href={scheme.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary text-sm px-4 py-2 inline-flex items-center space-x-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>{t('applyNow')}</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>


    </div>
  )
}