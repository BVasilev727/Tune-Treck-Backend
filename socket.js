const { parse } = require('dotenv')
const {joinRoom, startRoom, hangleGuess, leaveRoom} = require('./utils/roomManager')

module.exports = function setupMultiplayerSockets(server){

    const io = new (require('socket.io')).Server(server,{
        cors:{origin: '*'}
    })

    io.use(async(socket, next) =>
    {
        try{
            const raw = socket.handshake.headers.cookie || ''
            const parsed = cookie.parse(raw)
            
        }
        catch{}
    })

    io.on('connection', (socket) =>
    {
        socket.on('join_room', ({roomId,playerName}) =>
        {
            joinRoom(io, socket, roomId, playerName)
        })

        socket.on('start_game', ({roomId}) =>
        {
            startRound(io,roomId)
        })

        socket.on('guess', ({roomId, guess}) =>
        {
            handleGuess(io,socket,roomId,guess)
        })

        socket.on('disconnecting', () =>
        {
            leaveRoom(io,socket)
        })
    })
}