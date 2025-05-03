const cron = require('node-cron')
const Song = require('../models/songModel')
const {setSong} = require('../controllers/songController')
const { generateAndSaveNewSong } = require('../services/songService')

const startDailySongCron = () =>
{
    cron.schedule('0 0 * * *', async () =>
    {
        try{
            console.log('Running daily song choosing')

            const today = new Date()
            const startOfDay = new Date(today.setHours(0,0,0,0))

            const existingSong = await Song.findOne({createdAt: {$gte: startOfDay}})
            if(existingSong)
            {
                return console.log('song was already chosen today')
            }

            await generateAndSaveNewSong()
        }
        catch(error)
        {
            console.error('Cron job failed ', error.message)
        }
    })
}

const checkOrCreateNewSong = async () =>
{
    const today = new Date()
    const startOfDay = new Date(today.setHours(0,0,0,0))

    const existingSong = await Song.findOne({createdAt: {$gte: startOfDay}})
    if(!existingSong)
    {
        console.log(`cron job hasn't triggered, running manual song choosing`)
        await generateAndSaveNewSong()
    }
    else{
        console.log('song already chosen for today')
    }
}

module.exports = {startDailySongCron, checkOrCreateNewSong}