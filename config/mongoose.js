const mongoose = require('mongoose');

// storing the db on mongo atlas
const DB = "mongodb+srv://mostafataha:12341234@cluster0.2l0nv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// mongoose.connect('mongodb://127.0.0.1/habit_tracker');

mongoose.connect(DB).then(()=>{
    console.log('Connection successful!');
}).catch((err) => console.log("no connection " + err));

const db = mongoose.connection;

db.on('error', console.error.bind(console, "Error connecting to MongoDB"));

db.once('open', function(){
    console.log('Connected to Database :: MongoDB');
});

module.exports = db;