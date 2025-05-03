const axios = require('axios')

const getNewSongFromAPI = async() =>
{
    try{
        const response = await axios.get(`https://api.deezer.com/playlist/${process.env.PLAYLIST_ID}/tracks`)
        const randomSong = response.data.data[Math.floor(Math.random() * response.data.data.length)]

        return{
            trackId: randomSong.id,
            title: randomSong.title,
            artistName: randomSong.artist.name,
            album: randomSong.album.title,
            previewURL: randomSong.preview,
        }
    }
    catch(error)
    {
        console.error('error fetching song from Deezer API', error.message)
        throw new Error('Unable to fetch song')
    }
}
//serves for the update of previewURL when it has expired
const getSongFromAPI = async(trackId) =>
{
    try{
        const response = await axios.get(`https://api.deezer.com/track/${trackId}`)
        if(!response.data || !response.data.preview)
        {
            throw new Error('No preview URL found for this track')
        }
        const {id, title, artist, album, preview} = response.data
        return {
            trackId: id,
            title: title,
            artistName: artist.name,
            album: album.title,
            previewURL: preview
        }
    }
    catch(error)
    {
        console.error('error getting the track from the API', error.message)
        throw new Error('Unable to get the track')
    }
}

const getPlaylist = async() =>
{
    try{
        const response = await axios.get(`https://api.deezer.com/playlist/${process.env.PLAYLIST_ID}/tracks`)
        if(!response.data)
        {
            throw new Error('Error getting the playlist from the Deezer API')
        }
        return response.data
    }
    catch(error)
    {
        throw new Error('Error fetching playlist songs: ', error.message)
    }
}

module.exports = { getNewSongFromAPI, getSongFromAPI, getPlaylist}