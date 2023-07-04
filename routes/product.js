const mongoose = require("mongoose");

const productSchema = mongoose.Schema({

    subject : String,
    title : String,
    description : String,
    link : String,
    image:String,
    

})

module.exports = mongoose.model("product",productSchema);

