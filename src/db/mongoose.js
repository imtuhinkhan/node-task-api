const mongoose= require('mongoose');
mongoose.connect(process.env.MONGO_CONNECTION,{
    useNewUrlParser:true,
    useCreateIndex:true
})

