function parseSongResponse(song){
    if (!song) {
        throw new Error('no song given to parse')
    }
    const { id, title, artist, album, preview } = song
    return {
        trackId: id,
        title: title,
        artistName: artist.name,
        album: album.title,
        previewURL: preview
    }
}

function parseSongsResponse(songs){
   
    if(!Array.isArray(songs))
    {
        throw new Error('expected array of songs')
    }
    const parsedPlaylist = songs.map(parseSongResponse)
    return parsedPlaylist
}

module.exports =  { parseSongResponse, parseSongsResponse }