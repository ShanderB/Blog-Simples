const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
    eAdmin:{
        type: Number,
        default: 0,
        required: true
    },
    nome:{
        type: String,
        require: true,
    },
    email:{
        type: String,
        require: true
    },
    senha:{
        type: String,
        require: true
    }
})

mongoose.model("usuarios", Usuario);









