const {nanoid} = require('nanoid')
const {joinRoom} = require('./roomManager')
const socket = require('../socket')

let queue = []

module.exports
{
    requirestMatch: (io,socket,playerName) =>
    {
        queue.push({socket, playerName})
        if(queue.length >= 2)
        {
            const a = queue.shift()
            const b = queue.shift()
            const roomId = nanoid(8)

            joinRoom(io,a.socket, roomId, a.playerName)
            joinRoom(io,a.socket, roomId, a.playerName)

            io.to(roomId).emit('matched', {roomId, players: [a.playerName, b.playerName]})
        }
    }
    leaveQueue: (socket) =>
    {
        queue = queue.filter((p) => p.socket.id !== socket.id)
    }
}