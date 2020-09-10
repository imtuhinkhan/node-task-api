const User = require('../models/user')
const jwt= require('jsonwebtoken');

const auth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decode = jwt.verify(token,process.env.JWT_SECRTE) 
        const user = await User.findOne({_id:decode._id,'tokens.token':token})
        if(!user){
            throw new Error('Invalid Authorization')
        }
        req.userDetails = user
        req.token = token
        next()
    }catch(e){
        res.status(403).send('Invalid Authorization')
    }
}

module.exports = auth