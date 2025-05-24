const express = require('express')
const router = express.Router()
const {registerUser, loginUser, getCurrentUser, logoutUser} = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')
const {uploadImage} = require('../controllers/uploadController')
const {upload} = require('../middleware/multerMiddleware.js')
const { getLeaderboard } = require('../controllers/leaderboardController.js')

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/current', protect, getCurrentUser)
router.post('/upload', protect , upload.single('image'), uploadImage)
router.post('/logout', logoutUser)
router.get('/leaderboard', getLeaderboard)

module.exports = router