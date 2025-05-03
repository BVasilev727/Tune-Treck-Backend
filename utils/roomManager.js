const { default: authService } = require('../../frontend/src/features/auth/authService');
const songService = require('../services/deezerService');
const socket = require('../socket');

const rooms = {};

function ensureRoom(roomId){
    if(!rooms[roomId])
    {
        rooms[roomId] ={
            players: [],
            scores: {},
            currentSong: null,
            roundActive: false
        }
    }
}

exports.joinRoom = (io, socket, roomId, playerName) =>
{
    ensureRoom(roomId)

    const room = rooms[roomId]

    if(!room.players.find(p => p.id === socket.id))
    {
        room.players.push({id: socket.id, name:playerName})
        room.scores[socket.io] = 0;
        socket.join(roomId)
        io.to(roomId).emit('room_update', room.players)
    
    }
}

exports.startRound =async(io, roomId) =>
{
    const room = rooms[roomId]
    ensureRoom(roomId)
    if(!room || room.roundActive) return
    room.roundActive = true
    const song = await songService.getNewSongFromAPI()
    room.currentSong = song;
    io.to(roomId).emit('new_song', {previewURL: song.previewURL})
}

exports.handleGuess = (io,socket,roomId, guess) =>
{
    const room = rooms[roomId]
    if(!room?.roundActive) return

    const song = room.currentSong
    const correct = song.title.toLowerCase().trim() === guess.toLowerCase().trim()
    if(!correct) 
    {
        socket.emit('guess_result', {correct: false})
        return        
    }

    room.roundActive = false
    room.scores[socket.id] = 1

    const winnerId = socket.id
    const loserId = room.players.find(p => p.id !== socket.id).id

    //elo update here

    
}