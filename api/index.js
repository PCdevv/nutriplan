import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mealRoutes from './routes/mealRoutes.js'
import mealPlanRoutes from './routes/mealPlanRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NutriPlan Express API',
    database: 'Supabase',
    timestamp: new Date().toISOString(),
  })
})

// Routes (mounted with and without /api prefix for flexibility on Vercel & local proxy)
app.use(['/api/meals', '/meals'], mealRoutes)
app.use(['/api/meal-plans', '/meal-plans'], mealPlanRoutes)
app.use(['/api/favorites', '/favorites'], favoriteRoutes)
app.use(['/api/upload', '/upload'], uploadRoutes)

// 404 Handler for API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan di server API.`,
  })
})

// Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[API Server Error]', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
  })
})

export default app
