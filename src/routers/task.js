const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')


router.get('/tasks', auth,async(req,res)=>{
    const match ={}
    const sort ={}
    if(req.query.complete){
        match.complete = req.query.complete === 'true'
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]= parts[1] == 'desc' ? -1 : 1
    }
    try{
        await req.userDetails.populate({
            path:'task',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.userDetails.task)
    }catch(e){
        res.status(400).send(e)
        console.log(e);
    }
})

router.get('/tasks/:id', auth, async (req,res)=>{
    const _id = req.params.id
    try{
        const task = await Task.findOne({_id,owner:req.userDetails._id})
        console.log(task)
        if(!task){
            return res.status(404).send('No task Found')
        }
        res.status(201).send(task)
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.post('/tasks',auth, async(req,res)=>{
    const task = new Task({
        ...req.body,
        owner:req.userDetails._id
    });
    try{
        await task.save()
        res.send(task);
    }catch(e){
        res.status(400).send(err);
    }
})

router.patch('/tasks/:id', auth, async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowUpdate = ['title','description','complete']
    const isValidate = updates.every((update=> allowUpdate.includes(update)))
    if(!isValidate){
        return res.status(400).send({error:'Invalid Updates'})
    }
    
    try{
        const _id = req.params.id
        // const task =  await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        const task = await Task.findOne({_id,owner:req.userDetails._id})
        if(task){
            updates.forEach((update)=>task[update]=req.body[update])
            await task.save()
            res.status(200).send(task)
        }
        else res.status(400).send({error:'No task found'})

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res)=>{
    try{
        const _id = req.params.id
        const task = await Task.findOne({_id,owner:req.userDetails._id})
        if(!task){
            return res.status(400).send({error:'No task found'})
        }
        await task.remove()
        res.status(200).send(task)
    }catch(e){
        console.log(e)
        res.status(500).send()
    }
})

module.exports = router