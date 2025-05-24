const userService = require('../services/userService')

exports.getLeaderboard = async(req, res) =>
{
    try{
        const topPlayers = await userService.getTopPlayers()
        res.json(topPlayers)
    }
    catch(err)
    {
        res.status(500).json({error: err.message})
    }
}
