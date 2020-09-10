const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpge)$/)){
            return cb(new Error('Invalid Format'))
        }
        cb(undefined,true)
    }
});

router.post('/users',async(req,res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        const token = await user.webToken()
        res.send({user,token})
    }catch(err){
        res.status(400).send(err)
    }
})

// const UploadHandler = (req,res,next) =>{
//     throw new Error('form midd')
// }

router.post('/users/upload',auth,upload.single('upload'),async(req,res)=>{
    try{
        req.userDetails.avatar = req.file.buffer
        await req.userDetails.save()
        res.send(req.userDetails)
    }catch(err){
        res.status(400).send(err)
    }
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/avatar', auth, async(req,res)=>{
    try{
        req.userDetails.avatar = undefined 
        await req.userDetails.save()
        res.send(req.userDetails)
    }catch(err){
        res.status(400).send(err)
    }
})



router.post('/users/login',async(req,res)=>{
    try{
        const user = await User.findByCredential(req.body.email,req.body.password)
        const token = await user.webToken()
        res.send({user,token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)

    }
})

router.get('/users/logout',auth,async(req,res)=>{
    try{
        req.userDetails.tokens = req.userDetails.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.userDetails.save();
        res.status(200).send({response:'you are logged out'})

    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/logout/all',auth,async(req,res)=>{
    try{
        req.userDetails.tokens = [];
        await req.userDetails.save();
        res.status(200).send({response:'you are logged out'})

    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users',auth,async(req,res)=>{
    try{
        const user = await User.find({})
        res.status(201).send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/me',auth,async(req,res)=>{
    res.send(req.userDetails)
})

// router.get('/users/:id',async(req,res)=>{
//     try{
//         const _id = req.params.id
//         const user =  await User.findById(_id)

//         if(!user){
//             res.status(404).send({error:'No user found'})
//         }
//         res.status(200).send(user)
//     }catch(e){
//         res.status(500).send()
//     }
// })

router.patch('/users',auth,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowUpdate = ['name','email','password']
    const isValidate = updates.every((update=> allowUpdate.includes(update)))
    if(!isValidate){
        return res.status(400).send({error:'Invalid Updates'})
    }
    try{
        // const user = await User.findById(req.userDetails._id)
        updates.forEach((update)=>req.userDetails[update] = req.body[update]) 
        await req.userDetails.save();
        // const user =  await User.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        if(!req.userDetails){
            return res.status(400).send({error:'No user found'})
        }
        res.status(200).send(req.userDetails)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.userDetails.remove()
        res.status(200).send(req.userDetails)
    }catch(e){
        console.log(e)
        res.status(500).send(e)

    }
})
module.exports = router