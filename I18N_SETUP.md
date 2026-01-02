# React i18next Multi-Language Setup

## Installation

```bash
npm install react-i18next i18next i18next-browser-languagedetector
```

## Folder Structure

```
src/
├── locales/
│   ├── en/
│   │   └── translation.json
│   ├── hi/
│   │   └── translation.json
│   └── kn/
│       └── translation.json
├── components/
│   └── LanguageSwitcher.jsx
├── pages/
│   └── I18nDemo.jsx
├── i18n.js
└── main.jsx
```

## Usage in Components

### Basic Usage
```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

### Nested Keys
```jsx
<button>{t('navbar.home')}</button>
<button>{t('buttons.submit')}</button>
```

### Change Language Programmatically
```jsx
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { i18n } = useTranslation()
  
  const switchToHindi = () => {
    i18n.changeLanguage('hi')
  }
  
  return <button onClick={switchToHindi}>Switch to Hindi</button>
}
```

## Testing the Demo

Add this route to your App.jsx:
```jsx
import I18nDemo from './pages/I18nDemo'

// In your Routes:
<Route path="/i18n-demo" element={<I18nDemo />} />
```

Then visit: http://localhost:5173/i18n-demo

## Features Implemented

✅ Three languages: English (en), Hindi (hi), Kannada (kn)
✅ Browser language detection
✅ English as fallback language
✅ No errors for missing keys (console warning only)
✅ LanguageSwitcher component with dropdown
✅ Translation JSON files with sample keys
✅ Demo page showing all translations

## Adding New Translations

1. Add keys to all three translation files:
   - `src/locales/en/translation.json`
   - `src/locales/hi/translation.json`
   - `src/locales/kn/translation.json`

2. Use in components:
   ```jsx
   {t('your.new.key')}
   ```

## Current vs New System

Your app currently uses a custom `useLanguageStore` system. You have two options:

1. **Keep both systems** - Use i18next for new features
2. **Migrate completely** - Replace useLanguageStore with i18next

To migrate, replace:
```jsx
const { t } = useLanguageStore()
```

With:
```jsx
const { t } = useTranslation()
```
