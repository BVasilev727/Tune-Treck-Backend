const {userService} = require('../services/userService')
const songService = require('../services/deezerService')
const socket = require('../socket')
const matchmaker = require('../utils/matchmaker')

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

exports.joinRoom = (io, socket, roomId, userId, name) =>
{
    ensureRoom(roomId)

    const room = rooms[roomId]

    if(!room.players.find(p => p.id === socket.id))
    {
        room.players.push({socketId: socket.id, userId, name})
        room.scores[socket.io] = 0;
        socket.join(roomId)
        io.to(roomId).emit('room_update', room.players.map(p => p.name))
    
    }
}

exports.startRound =async(io, roomId) =>
{
    const room = rooms[roomId]
    ensureRoom(roomId)
    if(!room || room.roundActive) return
    room.roundActive = true
    const song = await songService.getNewSongFromAPI()
    room.currentSong = song
    console.log(roomId, room.currentSong)
    io.to(roomId).emit('new_song', room.currentSong)
}

exports.handleGuess = async (io,socket,roomId, guess) =>
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

    const winner= room.players.find(p => p.socketId == socket.id)
    const loser = room.players.find(p => p.id !== socket.id)

    const winnerNewElo = eloChange(winner.elo,loser.elo, 1)
    const loserNewElo = eloChange(loser.elo,winner.elo, 0)
    
    const updatedWinner = await userService.updateElo(winner.userId, winnerNewElo)
    const updatedLoser = await userService.updateElo(loser.userId, loserNewElo)
    
    io.to(roomId).emit('game_over', {
        winner: {name: winner.name, newElo: winnerId.elo},
        loser: {name: loser.name, newElo: loserId.elo}
    })

    delete rooms[roomId]
}

exports.leaveRoom = (io, socket) =>
{
    matchmaker.leaveQueue(socket)

    for(const roomId of socket.rooms)
    {
        if(roomId === socket.id) 
        {
            continue
        }
        
        const room = rooms[roomId]
        if(!room) continue
       
        room.players = room.players.filter(p => p.socketId !== socket.id)
        delete room.scores[socket.id]
        
        io.to(roomId).emit('room_update', room.players.map(p => p.name))
    }
}

function eloChange(playerElo, oponentElo, score)
{
    const k = 32;
    let e = 0.5 + (playerElo - oponentElo)/800;
    e = Math.max(0.01, Math.min(0.99, E))
    return Math.round(playerElo+k*(score - e))
}