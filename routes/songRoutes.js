const express = require('express')
const router = express.Router()
const { getSongFromDB, setSong, getNewSong, updatePreviewURL, getPlaylist, suggestSongs}  = require('../controllers/songController')

router.post('/new', setSong)
router.get('/get',getSongFromDB)
router.get('/getNew', getNewSong)
router.put('/update-preview/:trackId', updatePreviewURL)
router.get('/playlist', getPlaylist)
router.get('/suggestions',suggestSongs )

module.exports = router