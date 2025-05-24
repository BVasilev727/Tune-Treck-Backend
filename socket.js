const roomManager = require('./utils/roomManager')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const matchmaker = require('./utils/matchmaker')


module.exports = function setupMultiplayerSockets(io){

    io.use(async(socket, next) =>
    {
        const token = socket.handshake.auth?.token
        if(!token) 
        {
            return next(new Error('auth error, no token'))
        }
        try{
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = payload.id
            return next()
        }
        catch(err)
        {
            return next(new Error('auth error, invalid token'))
        }
    })
    io.on('connection_error', (err) =>
    {
        console.log(err.message)
    })
    io.on('connection', (socket) =>
    {
        socket.on('find_match', ({name}) =>
        {
            matchmaker.requestMatch(io, socket, socket.userId, name)
        })
        
        socket.on('join_room', (roomId) =>
        {
            roomManager.joinRoom(io,socket, roomId, socket.userId, socket.username)
        })

        socket.on('start_game',(roomId) =>
        {
            roomManager.startRound(io,roomId)
        })

        socket.on('guess', ({roomId, guess}) =>
        {
            roomManager.handleGuess(io,socket,roomId,guess)
        })

        socket.on('disconnecting', () =>
        {
            matchmaker.leaveQueue(socket)
            roomManager.leaveRoom(io,socket)
        })
    })
}