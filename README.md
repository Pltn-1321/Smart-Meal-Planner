# Smart Meal Planner

An AI-powered meal planning application that generates personalized weekly meal plans based on your preferences, budget, location, and available kitchen equipment. Features user authentication, data persistence, and an intuitive dashboard for managing plans, recipes, and shopping lists.

## Features

- **User Authentication**: Secure sign-up and login with Supabase
- **Dashboard Interface**: Tabbed interface with New Plan, My Recipes, My Lists, and Settings
- **Save & Manage Plans**: Save entire meal plans for future reference
- **Recipe Library**: Save and manage individual recipes from generated plans
- **Shopping Lists**: Save and organize shopping lists by date and store location
- **Personalized Meal Plans**: Generate complete weekly meal plans tailored to your specific needs
- **Budget Optimization**: Respects your budget constraints while maximizing nutritional value
- **Location Awareness**: Uses local ingredients and markets for authentic, cost-effective recipes
- **Flexible Preferences**: Supports various cuisines, dietary restrictions, and kitchen equipment
- **Recipe Generation**: Detailed recipes with step-by-step instructions and ingredient scaling
- **Shopping Lists**: Automated grocery lists organized by store locations
- **Batch Cooking**: Optimized cooking schedules to save time and reduce waste

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd smart-meal-planner
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:

   - Copy `.env.example` to `.env.local`
   - Add your OpenRouter API key:
     ```
     OPENROUTER_API_KEY=your_api_key_here
     ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses Supabase for data persistence. To save meal plans, recipes, and shopping lists, you need to set up the database schema:

1. Configure your Supabase project in `.env.local`:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Run the database schema:
   - Copy the SQL from `database/schema.sql`
   - Execute it in your Supabase SQL Editor or database console

For detailed setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md).

## How It Works

The application uses OpenRouter's AI models to generate comprehensive meal plans based on:

- Your location and local ingredients
- Budget constraints per person per week
- Preferred cuisine styles
- Available kitchen equipment
- Dietary restrictions and preferences

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend/Database**: Supabase (Authentication & PostgreSQL)
- **Build Tool**: Vite
- **AI Integration**: OpenRouter API
- **Styling**: Tailwind CSS with Lucide Icons

## API Configuration

The app is configured to use OpenRouter's API. The current model is set to `z-ai/glm-4.5-air:free` (free tier). You can modify the model in `services/openRouterService.ts` if needed.
