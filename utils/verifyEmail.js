const axios = require('axios')

const verifyEmail = async (email) =>
{
    const API_KEY = process.env.ABSTRACT_API_KEY
    const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${API_KEY}&email=${email}`

    try{
        const response = await axios.get(url)
        return response.data
    }
    catch(error)
    {
        console.log('email verifycation failed')
        return null
    }
}

module.exports = verifyEmail