# Chef Claude 🍳

An AI-powered recipe generator that creates personalized recipes based on the ingredients you have on hand. Built with React, Express, Claude AI, and Supabase.

## 🌟 Features

- **Smart Recipe Generation**: Input your available ingredients and get AI-generated recipes
- **User Authentication**: Secure sign-up and sign-in with Supabase Auth
- **Recipe Saving**: Save your favorite recipes to your personal collection
- **Rate Limiting**: Fair usage limits with user-friendly warnings
- **Nutritional Information**: Each recipe includes macro information (calories, protein, carbs, etc.)
- **Modern UI**: Clean, responsive interface built with React and TypeScript
- **Real-time Processing**: Fast recipe generation using Claude AI
- **Ingredient Management**: Add and manage your ingredient list easily
- **Recipe History**: Access your saved recipes anytime

## 🚀 Live Demo

**Try Chef Claude now**: [https://chef-claude-liard.vercel.app](https://chef-claude-liard.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Markdown** for recipe formatting
- **Supabase Client** for authentication and database
- **CSS3** for styling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Claude AI** for recipe generation
- **Supabase** for authentication and database
- **Redis** for rate limiting
- **Zod** for input validation
- **CORS** for cross-origin requests

### Database & Services
- **Supabase**: Authentication and PostgreSQL database
- **Redis**: Rate limiting and caching
- **Claude AI**: Recipe generation

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Environment Variables**: Secure API key management

## 🏗️ Project Structure

```
chef-claude/
├── my-app/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Auth.tsx           # Authentication component
│   │   │   ├── Main.tsx           # Main app component
│   │   │   ├── ClaudeRecipe.tsx   # Recipe display
│   │   │   ├── RateLimitWarning.tsx # Rate limit UI
│   │   │   └── ...
│   │   ├── utils/         # Utility functions
│   │   │   ├── ai.ts             # AI API integration
│   │   │   ├── supabase.ts       # Supabase client
│   │   │   └── recipe.ts         # Recipe management
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── routes/            # API routes
│   │   ├── ai.ts          # AI recipe generation
│   │   ├── recipes.ts     # Recipe CRUD operations
│   │   └── profiles.ts    # User profile management
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   └── rateLimiter.ts # Rate limiting middleware
│   ├── utils/             # Server utilities
│   │   ├── redisRateLimiter.ts # Redis rate limiting
│   │   └── supabase.ts    # Supabase server client
│   ├── index.ts           # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key
- Supabase account and project
- Redis instance (local or cloud)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chef-claude
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd my-app
   npm install
   
   # Install backend dependencies
   cd ../server
   npm install
   ```

3. **Set up environment variables**
   
   **Backend** (create `server/.env`):
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   REDIS_URL=redis://localhost:6379
   RATE_LIMIT_RECIPES=10
   RECIPE_RATE_LIMIT_WINDOW_MS=86400000
   NODE_ENV=development
   ```
   
   **Frontend** (create `my-app/.env`):
   ```
   VITE_API_URL=http://localhost:4000/api
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   
   Create the following tables in your Supabase project:
   
   **profiles table:**
   ```sql
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) PRIMARY KEY,
     full_name TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
   
   **recipes table:**
   ```sql
   CREATE TABLE recipes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     ingredients TEXT NOT NULL,
     instructions TEXT NOT NULL,
     macros TEXT NOT NULL,
     recipe TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Start Redis** (if running locally):
   ```bash
   redis-server
   ```

6. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd my-app
   npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 📖 How to Use

1. **Sign Up/In**: Create an account or sign in to access all features
2. **Add Ingredients**: Type ingredients you have available
3. **Generate Recipe**: Click "Get a recipe" when you have 3+ ingredients
4. **View Recipe**: See the AI-generated recipe with nutritional information
5. **Save Recipe**: Save your favorite recipes to your personal collection
6. **Access History**: View and manage your saved recipes anytime
7. **Rate Limiting**: Fair usage limits ensure quality service for all users

## 🔧 API Endpoints

### Authentication Required Endpoints

#### POST `/api/ai/generate-recipe`
Generates a recipe based on provided ingredients.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "onions", "garlic"]
}
```

**Response:**
```json
{
  "recipe": "# Chicken and Rice Recipe\n\n## Ingredients\n- 2 chicken breasts\n- 1 cup rice\n...",
  "recipeData": {
    "title": "Chicken and Rice Recipe",
    "ingredients": "- 2 chicken breasts\n- 1 cup rice\n...",
    "instructions": "1. Cook chicken...",
    "macros": "Calories: 400\nProtein: 35g..."
  },
  "rateLimit": {
    "allowed": true,
    "remaining": 9,
    "reset": 1759590242388
  }
}
```

#### POST `/api/recipes`
Save a recipe to the user's collection.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Chicken and Rice Recipe",
  "ingredients": "- 2 chicken breasts\n- 1 cup rice\n...",
  "instructions": "1. Cook chicken...",
  "macros": "Calories: 400\nProtein: 35g...",
  "recipe": "# Chicken and Rice Recipe\n\n## Ingredients\n..."
}
```

#### GET `/api/recipes`
Get all recipes for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Chicken and Rice Recipe",
    "ingredients": "- 2 chicken breasts\n- 1 cup rice\n...",
    "instructions": "1. Cook chicken...",
    "macros": "Calories: 400\nProtein: 35g...",
    "recipe": "# Chicken and Rice Recipe\n\n## Ingredients\n...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET `/api/profiles`
Get user profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "full_name": "John Doe",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `my-app`
3. Add environment variables:
   - `VITE_API_URL=https://your-railway-url.railway.app/api`
   - `VITE_SUPABASE_URL=your_supabase_project_url`
   - `VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`
4. Deploy!

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory to `server`
3. Add environment variables:
   - `ANTHROPIC_API_KEY=your_api_key`
   - `SUPABASE_URL=your_supabase_project_url`
   - `SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`
   - `REDIS_URL=your_redis_url`
   - `RATE_LIMIT_RECIPES=10`
   - `RECIPE_RATE_LIMIT_WINDOW_MS=86400000`
   - `FRONTEND_URL=https://your-vercel-url.vercel.app`
4. Deploy!

### Database (Supabase)
1. Create a new Supabase project
2. Run the SQL schema provided in the setup section
3. Enable Row Level Security (RLS) on both tables
4. Configure authentication settings

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-server.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REDIS_URL=redis://your-redis-url:6379
RATE_LIMIT_RECIPES=10
RECIPE_RATE_LIMIT_WINDOW_MS=86400000
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

## 🚦 Rate Limiting

Chef Claude implements fair usage rate limiting to ensure quality service for all users:

- **Daily Limit**: 10 recipe generations per user per day
- **Reset Time**: Limits reset every 24 hours
- **User-Friendly Warnings**: Clear UI notifications when limits are reached
- **Real-time Tracking**: Live countdown and remaining request display

Rate limiting is implemented using Redis for fast, distributed tracking across multiple server instances.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Anthropic** for providing the Claude AI API
- **Supabase** for authentication and database services
- **Vercel** for frontend hosting
- **Railway** for backend hosting
- **Redis** for rate limiting infrastructure
- **React** and **Express** communities for excellent documentation

---

**Made with ❤️ by Youssef Mahmoud**

*Happy cooking! 🍳✨*
