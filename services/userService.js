import User from '../models/userModel'

export async function updateElo(userId, newElo){
    return await User.findByIdAndUpdate(
        userId,
        {elo: newElo},
        {new: true}
    )
}

export async function findById(id){
    return await User.findById(id)
}