const mongoose= require('mongoose');
const validator= require('validator');
const taskSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    complete:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Users'
    }

}, {
    timestamps:true
})
const Task = mongoose.model('Tasks',taskSchema)
module.exports = Task
