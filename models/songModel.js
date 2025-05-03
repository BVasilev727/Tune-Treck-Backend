const mongoose = require('mongoose')

const songSchema = mongoose.Schema(
    {
        //Id for the deeze api
        trackId: {type: String, unique: true, required:[true, 'trackId needed']},
        //song title
        title:{ type: String, required:[true, 'Please add title']},
        //artist of the song
        artistName: {type: String, required:[true, 'Artist name needed']},
        //album that the song is in
        album: {type: String, required:[true, 'Album name needed']},
        //preview url needed for playback
        previewURL: {type: String, required:[true, 'Preview URL needed']}
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Song', songSchema)