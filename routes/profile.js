const mongoose = require("mongoose");

const courceSchema = mongoose.Schema({

    name : String,
    link : String,
    token : String,
    userid : String
    

})

module.exports = mongoose.model("cource", courceSchema);

