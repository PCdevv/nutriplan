import { Router } from 'express'
import { FavoriteController } from '../controllers/favoriteController.js'

const router = Router()

router.get('/', FavoriteController.getFavorites)
router.post('/toggle', FavoriteController.toggleFavorite)

export default router
