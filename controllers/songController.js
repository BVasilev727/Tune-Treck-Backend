const asyncHandler = require('express-async-handler')
const Song = require('../models/songModel')
const {getNewSongFromAPI} = require('../services/deezerService')
const {generateAndSaveNewSong, updatePreviewURLInDB, getPlaylistSongs, getSuggestedSongs} = require('../services/songService')

//gets a new song witout saving it
const getNewSong = async (req,res) =>
{
    try{
        const songData = await getNewSongFromAPI();
        res.status(200).json({songData})
        return songData;
    }
    catch(error)
    {
        console.error('error in getNewSong:', error.message)
        throw new Error('unable to fetch song')
    }
}

//get the song from the database
const getSongFromDB = asyncHandler(async(req, res) =>
{
    try{
    const song = await Song.findOne().sort({createdAt: -1})
    if(!song)
    {
        return res.status(401).json({success: false, message:'No song found'})
    }
    res.status(200).json({success:true, song})
    }
    catch(error)
    {
        console.error(`Error fetching most recent song:`, error.message)
        return res.status(500).json({success:false, message: 'server error'})
    }
})
//serves as the endpoint for saving the song into the database
const setSong = asyncHandler(async(req,res) =>
{
    try{
        const newSong = await generateAndSaveNewSong()
        res.status(200).json(newSong);
    }
    catch(error)
    {
        console.error('error in setSong', error.message)
    }
})

//serves as the endpoint for updating the previewURL if it is expired
const updatePreviewURL = asyncHandler(async(req,res) =>
{
    const {trackId} = req.params

    if(!trackId)
    {
        res.status(400)
        throw new Error('Track ID is required')
    }

    const updatedSong = await updatePreviewURLInDB(trackId)
    res.status(200).json(updatedSong)
})

//serves as the endpoint for getting all songs from the playlist
const getPlaylist = asyncHandler(async(req,res) =>
{
    const playlist = await getPlaylistSongs()
    res.status(200).json(playlist)
    return playlist
})
//serves as an endpoint for getting suggestions based on text
const suggestSongs = asyncHandler(async (req, res) =>
{
    const query = req.query.q
    if(!query)
    {
        res.status(400)
        throw new Error('Search query required')
    }
    const suggestions = await getSuggestedSongs(query)
    res.status(200).json(suggestions)
    //return suggestions
})
module.exports = {getNewSong, getSongFromDB, setSong, updatePreviewURL, getPlaylist, suggestSongs}