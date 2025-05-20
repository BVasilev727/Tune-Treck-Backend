const express = require('express')
const router = express.Router()
const {registerUser, loginUser, getCurrentUser, logoutUser} = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')
const {uploadImage} = require('../controllers/uploadController')
const {upload} = require('../middleware/multerMiddleware.js')

router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/current', protect, getCurrentUser)
router.post('/upload', protect , upload.single('image'), uploadImage)
router.post('/logout', logoutUser)

module.exports = router