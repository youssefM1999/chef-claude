# Chef Claude 🍳

An AI-powered recipe generator that creates personalized recipes based on the ingredients you have on hand. Built with React, Express, and Claude AI.

## 🌟 Features

- **Smart Recipe Generation**: Input your available ingredients and get AI-generated recipes
- **Nutritional Information**: Each recipe includes macro information (calories, protein, carbs, etc.)
- **Modern UI**: Clean, responsive interface built with React and TypeScript
- **Real-time Processing**: Fast recipe generation using Claude AI
- **Ingredient Management**: Add and manage your ingredient list easily

## 🚀 Live Demo

**Try Chef Claude now**: [https://chef-claude-liard.vercel.app](https://chef-claude-liard.vercel.app)

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development and building
- **React Markdown** for recipe formatting
- **CSS3** for styling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Claude AI** for recipe generation
- **Zod** for input validation
- **CORS** for cross-origin requests

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Environment Variables**: Secure API key management

## 🏗️ Project Structure

```
chef-claude/
├── my-app/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── ai.ts          # API integration
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── index.ts           # Main server file
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Anthropic API key

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
   NODE_ENV=development
   ```
   
   **Frontend** (create `my-app/.env`):
   ```
   VITE_API_URL=http://localhost:4000/api/recipe
   ```

4. **Start the development servers**
   
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

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 📖 How to Use

1. **Add Ingredients**: Type ingredients you have available
2. **Generate Recipe**: Click "Get a recipe" when you have 3+ ingredients
3. **View Recipe**: See the AI-generated recipe with nutritional information
4. **Add More**: Continue adding ingredients to refine your recipe

## 🔧 API Endpoints

### POST `/api/recipe`
Generates a recipe based on provided ingredients.

**Request Body:**
```json
{
  "ingredients": ["chicken", "rice", "onions", "garlic"]
}
```

**Response:**
```json
{
  "recipe": "# Chicken and Rice Recipe\n\n## Ingredients\n- 2 chicken breasts\n- 1 cup rice\n..."
}
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set root directory to `my-app`
3. Add environment variable: `VITE_API_URL=https://your-railway-url.railway.app/api/recipe`
4. Deploy!

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set root directory to `.` (root)
3. Add environment variables:
   - `ANTHROPIC_API_KEY=your_api_key`
   - `FRONTEND_URL=https://your-vercel-url.vercel.app`
4. Deploy!

## 🔐 Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-server.railway.app/api/recipe
```

### Backend (.env)
```
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

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
- **Vercel** for frontend hosting
- **Railway** for backend hosting
- **React** and **Express** communities for excellent documentation

---

**Made with ❤️ by [Your Name]**

*Happy cooking! 🍳✨*
