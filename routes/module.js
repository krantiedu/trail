const mongoose = require("mongoose");

const moduleSchema = mongoose.Schema({
    image : String,
    topic : String,
    title : String,
    description : String,
    link : String,
    productid: String,
    
    

})

module.exports = mongoose.model("module",moduleSchema);