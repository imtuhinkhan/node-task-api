const mongoose= require('mongoose');
const validator= require('validator');
const bcryptjs= require('bcryptjs');
const jwt= require('jsonwebtoken');
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true

    },
    email:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type: String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(validator.equals(value,'password')){
                 throw new Error('You cant not use this word')
            }
        }
    },
    avatar:{
        type: Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    
}, {
    timestamps:true
})

userSchema.virtual('task',{
    ref:'Tasks',
    localField:'_id',
    foreignField:'owner'
})
//login
userSchema.methods.webToken  = async function(){
    const token = jwt.sign({_id:this._id.toString()},'thisissignature')
    this.tokens =this.tokens.concat({token})
    await this.save()
    return token
}

userSchema.statics.findByCredential = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('No User Found')
    }
    const isMatch = await bcryptjs.compare(password,user.password)
    if(!isMatch){
        throw new Error('Invalid Password')
    }
    return user
}

userSchema.methods.toJSON = function(){
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}


userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password,8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    await Task.deleteMany({
        owner:this._id
    })
    next()
})

const User = mongoose.model('Users',userSchema)

module.exports = User