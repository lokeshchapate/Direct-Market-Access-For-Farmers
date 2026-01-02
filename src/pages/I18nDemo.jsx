import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function I18nDemo() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Language Switcher */}
          <div className="flex justify-end mb-8">
            <LanguageSwitcher />
          </div>

          {/* Title and Description */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('description')}
            </p>
          </div>

          {/* Navbar Demo */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('navbar.home')} Navigation
            </h2>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {t('navbar.home')}
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                {t('navbar.about')}
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                {t('navbar.products')}
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                {t('navbar.contact')}
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {t('navbar.login')}
              </button>
            </div>
          </div>

          {/* Buttons Demo */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('buttons.submit')} Buttons
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                {t('buttons.submit')}
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                {t('buttons.cancel')}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {t('buttons.save')}
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                {t('buttons.edit')}
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t('buttons.add')}
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                {t('buttons.delete')}
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {t('buttons.search')}
              </button>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                {t('buttons.filter')}
              </button>
            </div>
          </div>

          {/* Common Messages */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {t('common.welcome')} Messages
            </h2>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{t('common.loading')}</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">{t('common.success')}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{t('common.error')}</p>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">{t('common.welcome')}</p>
              </div>
            </div>
          </div>

          {/* Footer Demo */}
          <div className="border-t pt-6">
            <div className="text-center text-gray-600 space-y-2">
              <p>{t('footer.copyright')}</p>
              <div className="flex justify-center gap-4 text-sm">
                <a href="#" className="hover:text-blue-600">{t('footer.privacy')}</a>
                <span>|</span>
                <a href="#" className="hover:text-blue-600">{t('footer.terms')}</a>
                <span>|</span>
                <a href="#" className="hover:text-blue-600">{t('footer.contact')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
