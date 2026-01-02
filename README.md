# Direct Market Access for Farmers

A React.js web application that connects farmers directly with buyers, eliminating middlemen and ensuring fair pricing for agricultural produce.

## Features

### MVP (Phase 1) - ✅ Implemented
- **Authentication**: Email-based registration and login with Supabase Auth
- **Role-based Access**: Separate dashboards for farmers and buyers
- **Farmer Features**:
  - Profile management with farm details
  - Product listing creation with images
  - Order management (accept/reject orders)
  - Dashboard with sales statistics
- **Buyer Features**:
  - Product browsing with search and filters
  - Shopping cart functionality
  - Order placement with Cash on Delivery
  - Order tracking and history
- **Product Management**: CRUD operations for crop listings
- **Image Upload**: Supabase Storage integration for product photos

### Upcoming Phases

#### Phase 2 - Growth & Trust
- Price transparency dashboard with government API integration
- Rating and review system
- Real-time chat between farmers and buyers
- Enhanced order tracking
- Payment gateway integration (Razorpay/Stripe)

#### Phase 3 - Community & Intelligence
- Weather information integration
- Sales analytics and insights
- Demand forecasting
- Multi-language support (Hindi, Kannada, Telugu, English)
- Voice navigation for low-literate farmers

#### Phase 4 - Advanced Features
- Logistics integration with delivery tracking
- AI-powered chatbot for farmer support
- Crop recommendation system
- QR code-based produce traceability
- Blockchain-based smart contracts
- Mobile app with offline support

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage, Realtime)
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd direct-market-access-farmers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
- Create a new Supabase project
- Run the SQL commands from `supabase-schema.sql` in the SQL editor
- Create a storage bucket named `product-images` with public access

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar with auth state
│   ├── ProductCard.jsx # Product display card
│   ├── ProductForm.jsx # Add/edit product form
│   ├── OrderTable.jsx  # Order management table
│   └── ProtectedRoute.jsx # Route protection wrapper
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Authentication page
│   ├── Register.jsx    # User registration
│   ├── FarmerDashboard.jsx # Farmer control panel
│   └── BuyerDashboard.jsx  # Buyer interface
├── store/              # State management
│   └── authStore.js    # Authentication state
├── lib/                # Utilities and configurations
│   └── supabase.js     # Supabase client setup
└── App.jsx             # Main application component
```

## Database Schema

### Tables
- **profiles**: User profiles with role-based information
- **products**: Crop listings with details and pricing
- **orders**: Order management with status tracking

### Key Features
- Row Level Security (RLS) for data protection
- Automatic profile creation on user registration
- Image storage with public access policies
- Real-time subscriptions ready for future features

## Design System

- **Colors**: Green primary (#22c55e) with earth tones
- **Typography**: Inter font family
- **Components**: Consistent spacing and rounded corners
- **Responsive**: Mobile-first design approach
- **Accessibility**: High contrast and keyboard navigation

## Contributing

This project is designed for scalable development:

1. **Component-based**: Reusable UI components
2. **Type-safe**: Ready for TypeScript migration
3. **Performance**: Lazy loading and optimized queries
4. **Modular**: Easy to add new features and integrations

## About

**Developer**: Lokesh Chapate  
**Email**: lokeshchapate725@gmail.com  
**Phone**: 9902279352

Building technology solutions to empower farmers and create transparent, fair marketplaces for agricultural produce.

## License

This project is developed for educational and social impact purposes.