const roomManager = require('./utils/roomManager')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const matchmaker = require('./utils/matchmaker')


module.exports = function setupMultiplayerSockets(io){

    io.use(async(socket, next) =>
    {
        const raw = socket.handshake.headers.cookie || ''
        const parsed = cookie.parse(raw)
        const token = parsed.token
        if(!token) 
        {
            return next(new Error('auth error'))
        }
        try{
            const {id} = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = id
            return next()
        }
        catch(err)
        {
            return next(new Error('auth error'))
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

        socket.on('start_game', ({roomId}) =>
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