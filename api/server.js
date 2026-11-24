import app from './index.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`[NutriPlan API] Express server running at http://localhost:${PORT}`)
  console.log(`[NutriPlan API] Ready to handle requests on /api/*`)
})
