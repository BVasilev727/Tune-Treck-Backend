const express = require('express')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./middleware/errorMiddleware')
const connectDB = require('./connect/database')
const port = process.env.PORT || 5000
const {startDailySongCron, checkOrCreateNewSong} = require('./cron/dailySongCron')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const {Server} = require('socket.io')
const http = require('http')
const setupMultiplayerSockets = require('./socket')

//Express setup
connectDB()
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use(cors({
    origin: (origin, callback) => {
      console.log(origin)
      if (!origin || origin===process.env.CORS_ORIGIN) {
        return callback(null, true);
      } 
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }));
app.use('/api/song', require('./routes/songRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

app.use(errorHandler)

const server = http.createServer(app)
const io = new Server(server,
  {
    cors:
    {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials:true
    }
  }
)

setupMultiplayerSockets(io)

startDailySongCron()
checkOrCreateNewSong()

server.listen(port, () => console.log(`Server listening on ${port}`))