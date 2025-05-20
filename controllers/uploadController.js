const cloudinary = require('../utils/cloudinaryUtil.js');
const expressAsyncHandler =require("express-async-handler");
const User =require('../models/userModel.js')

const uploadImage = expressAsyncHandler(async (req, res) =>
{
    if(!req.file)
    {
        res.status(400)
        throw new Error('no file uploaded')
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_pictures',
        resource_type: 'image'
    })

    const updatedUser = await User.findByIdAndUpdate(req.user._id,
            {profilePicture: result.secure_url},
            {new: true}
    )

    if(!updatedUser)
    {
        res.status(400)
        throw new Error('no such user found')
    }

    res.json({message: 'profile picture successfully updated'})
})

module.exports = {uploadImage}