const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
// mongoose.connect("mongodb://127.0.0.1:27017/nextnode").then(function(){
//   console.log("database successfully connected")
// })


mongoose.connect("mongodb+srv://aakarshsshu2:Anushri1437@cluster0.qsx7qvt.mongodb.net/education?retryWrites=true&w=majority").then(function(){
  console.log("database successfully connected")
})




const userSchema = mongoose.Schema({
  // name : String,
  username : String,
  // email : String,
  password : String
})
userSchema.plugin(plm);
module.exports = mongoose.model("user",userSchema);