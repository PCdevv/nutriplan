import { Router } from 'express'
import { MealController } from '../controllers/mealController.js'

const router = Router()

router.get('/', MealController.getMeals)
router.get('/:id', MealController.getMealById)
router.post('/', MealController.createMeal)
router.put('/:id', MealController.updateMeal)
router.delete('/:id', MealController.deleteMeal)

export default router
