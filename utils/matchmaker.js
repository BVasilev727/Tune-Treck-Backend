const {nanoid} = require('nanoid')
const roomManager = require('./roomManager')
const socket = require('../socket')

let queue = []

exports.requestMatch = (io,socket,playerName) =>
    {
        queue.push({socket, playerName})
        if(queue.length >= 2)
        {
            const a = queue.shift()
            const b = queue.shift()
            const roomId = nanoid(8)

            roomManager.joinRoom(io,a.socket, roomId, a.userId, a.playerName)
            roomManager.joinRoom(io,b.socket, roomId, b.userId,b.playerName)

            io.to(roomId).emit('matched', {roomId, players: [a.playerName, b.playerName]})

            roomManager.startRound(io, roomId)
        }
    }
exports.leaveQueue=(socket) =>
{
    queue = queue.filter((p) => p.socket.id !== socket.id)
}