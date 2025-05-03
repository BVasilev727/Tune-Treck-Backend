const {getNewSongFromAPI, getSongFromAPI, getPlaylist} = require('../services/deezerService');
const Song = require('../models/songModel');
const {parseSongsResponse} = require('../utils/parseResponseToModel');

const generateAndSaveNewSong = async () =>
{
    const song = await getNewSongFromAPI()
    
    const songExists = await Song.findOne({trackId: song.trackId})

    if(songExists)
    {
        console.log('generated song already exists, generating new')
        return await generateAndSaveNewSong()
    }

    const newSong = await Song.create({
            trackId: song.trackId,
            title: song.title,
            artistName: song.artistName,
            album: song.album,
            previewURL: song.previewURL
    })

    removeSongIfNeeded()

    return newSong
}

const removeSongIfNeeded = async () =>
{
    const songCount = await Song.countDocuments()

    if(songCount > 5)
    {
        const oldestSong = await Song.findOne().sort({createdAt: 1})
        if(oldestSong)
        {
            await Song.findByIdAndDelete(oldestSong._id)
            console.log(`${oldestSong.title} deleted`)
        }
    }
}

const updatePreviewURLInDB = async (trackId) =>
{
    const track = await getSongFromAPI(trackId)

    if(!track.previewURL)
    {
        throw new Error('preview URL not available for this track')
    }
    const updatedSong = await Song.findOneAndUpdate({trackId},
        {
            previewURL: track.previewURL
        },
        {new: true}
    )
    if(!updatedSong)
    {
        throw new Error('Song not found in the database')
    }
    
    return updatedSong
}

const getPlaylistSongs = async () =>
{
    const playlist = await getPlaylist()
    const parsedPlaylist = parseSongsResponse(playlist.data)
    return parsedPlaylist
}

const getSuggestedSongs = async(queryText) =>
{
    const playlist = await getPlaylist()
    const parsedPlaylist = parseSongsResponse(playlist.data)
    const normalizedQuery = queryText.toLowerCase()

    return parsedPlaylist.filter(song =>
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artistName.toLowerCase().includes(normalizedQuery) ||
        song.album.toLowerCase().includes(normalizedQuery)
    )
}

module.exports = {generateAndSaveNewSong, updatePreviewURLInDB,getPlaylistSongs, getSuggestedSongs}