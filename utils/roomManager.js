const userService =require('../services/userService')
const {getNewSongFromAPI} = require('../services/deezerService')
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
    
    socket.join(roomId)

    if(!room.players.find(p => p.socketId === socket.id))
    {
        room.players.push({socketId: socket.id, userId, name})
        room.scores[socket.id] = 0;
        io.to(roomId).emit('room_update', room.players.map(p => ({userId: p.userId, name: p.name})))
    }
    
    if(room.roundActive && room.currentSong)
    {
        socket.emit('new_song', room.currentSong)
    }
}

exports.startRound =async(io, roomId) =>
{
    ensureRoom(roomId)

    const room = rooms[roomId]
    
    if(!room || room.roundActive) return
    room.roundActive = true
    const song = await getNewSongFromAPI()
    room.currentSong = song
    io.to(roomId).emit('new_song', song)
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

    const winnerMeta= room.players.find(p => p.socketId == socket.id)
    const loserMeta = room.players.find(p => p.socketId !== socket.id)

    const winnerUser = await userService.findById(winnerMeta.userId)
    const loserUser = await userService.findById(loserMeta.userId)

    const winnerNewElo = eloChange(winnerUser.elo,loserUser.elo, 1)
    const loserNewElo = eloChange(loserUser.elo,winnerUser.elo, 0)
    
    const updatedWinner = await userService.updateElo(winnerMeta.userId, winnerNewElo)
    if(!updatedWinner)
    {
        console.error('failed to update winner elo', winnerMeta.userId);
        return;
    }
    const updatedLoser = await userService.updateElo(loserMeta.userId, loserNewElo)
       if(!updatedWinner)
    {
        console.error('failed to update loser elo', loserMeta.userId);
        return;
    }
    io.to(roomId).emit('game_over', {
        winner: {name: winnerUser.name, newElo: updatedWinner.elo},
        loser: {name: loserUser.name, newElo: updatedLoser.elo}
    })

    room.players.forEach(p => {
        const playerSocket = io.sockets.sockets.get(p.socketId)
        if(playerSocket) playerSocket.leaveRoom(roomId)
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
    e = Math.max(0.01, Math.min(0.99, e))
    return Math.round(playerElo+k*(score - e))
}