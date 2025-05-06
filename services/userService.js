const User = reqire('../models/userModel')

exports.updateElo = (userId, newElo) =>
{
    User.findByIdAndUpdate(
        userId,
        {elo: newElo},
        {new: true}
    )
}

exports.findById = (id) =>
{
    User.findById(id)
}