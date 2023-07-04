require('dotenv').config();
var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const userModel = require("./users.js");
const productModel = require("./product.js");
const moduleModel = require("./module.js")
const cors = require('cors');
router.use(cors());


//================It's code for aws s3 web servics====================//


// const {S3Client , GetObjectCommand , PutObjectCommand} = require("@aws-sdk/client-s3");
// const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

// const s3Client = new S3Client({
//   region: "ap-south-1",
//   credentials: {
//     
//   }
// })

// async function getObjectURL(key){
//   const command = new GetObjectCommand({
//     Bucket: "node-private-bucket",
//     Key : key,
//   });
//   const url = await getSignedUrl(s3Client,command);
//   return url;
// }

// async function init(){
//     console.log("URL for graphql.jpeg" , await getObjectURL("photo-1460904577954-8fadb262612c.avif"))
// }
// init();


// async function putObject(filename , contentType){
//   const command = new PutObjectCommand({
//     Bucket:"node-private-bucket",
//     Key: `uploads/user-uploads/${filename}`,
//     ContentType: contentType,
//   });
//   const url = await getSignedUrl(s3Client , command);
//   return url;
// }

// async function init(){
//   console.log("URL for uploading" , await putObject(`image-${Date.now()}.jpeg` , "image/jpeg"))
// }
// init();






//======================================On yourself code for uploaad files on aws s3 bucket================================//

const { S3Client, GetObjectCommand,PutObjectCommand } = require('@aws-sdk/client-s3');
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const profileModel = require("./profile.js");

router.get("/allcource",function(req,res){
  profileModel.find().then(function(allcources){
    res.send(allcources)
  })
})

// AWS SDK configuration
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});

// Multer middleware for handling file uploads
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: 'kranti2023',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `uploads/user-uploads/${uniqueSuffix}.${file.originalname.split('.').pop()}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    
  }),
});

// Route for serving the upload form
router.get('/upload', function (req, res) {
  res.render('upload');
});

// router.post('/upload', upload.single('image'), async (req, res) => {
//   // File uploaded successfully
  
//   // Get the uploaded file name
//   // const fileName = req.file.originalname; //it's not required

//   // Construct the S3 object key
 
//   const s3Key = req.file.key;

//   const fileName = path.basename(req.file.key); //it's also not required



//   // Generate a pre-signed URL for the uploaded file

//   const command = new GetObjectCommand({
//     Bucket: 'aakarsh1437',
//     Key: req.file.key,
//     ContentType: req.file.mimetype,
//   });
//   const url = await getSignedUrl(s3Client, command);
// console.log(url)

 
//   profileModel.create({
//     name : req.body.name,
//     link:url
//   }).then(function(){
//     res.render('success', { imageUrl: url });
//   })



  
// });












// Assuming you have the necessary MongoDB setup and connection

// ...

// router.post('/upload', upload.single('image'), async (req, res) => {
//   // File uploaded successfully

//   // Get the URL of the uploaded image
//   const imageUrl = `https://aakarsh1437.s3.ap-south-1.amazonaws.com/${req.file.key}`;

//   // Save the URL to MongoDB
//   const newCource = new profileModel({
//     name: req.body.name,
//     link: imageUrl,
//   });

//   newCource.save()
//     .then(() => {
//       res.render('success', { imageUrl: imageUrl });
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send('Failed to save the URL');
//     });
// });



let globalUser = null;
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
        const oldprofile = await profileModel.findOne({userid:globalUser._id});
        if(oldprofile){
          await profileModel.findOneAndDelete({userid:globalUser._id});
        }



  // File uploaded successfully

    // Get the URL of the uploaded image
    const imageUrl = `https://kranti2023.s3.ap-south-1.amazonaws.com/${req.file.key}`;
    



    // Save the URL to MongoDB or perform any other desired operations
    const newCource = new profileModel({
      name: req.body.name,
      link: imageUrl,
      token : req.body.token,
      userid : globalUser._id
    });

    await newCource.save();

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save the URL' });
  }
});






//========================================Show profile Api=========================================//

router.post('/showprofile', function (req, res) {
  const token = req.body.token;
  console.log(globalUser._id)
  profileModel.findOne({ userid:globalUser._id }, function (error, profile) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(profile);
    }
  });
});


//==========================for passport js===========================//

const localStrategy = require("passport-local")
const passport = require("passport");
passport.use(new localStrategy(userModel.authenticate()));



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/allusers', function(req, res, next) {
  
  userModel.find().then(function(allusers){
    res.send(allusers);
  })
});

router.get("/profile",isloggedin,function(req,res){
  res.send("it's your profile")
})

router.get("/login",function(req,res,next){
  res.render("login");
})


//=================================router for products========================================//

router.get("/product",function(req,res){
  res.render("product");
})


router.post('/product', upload.single('image'), async (req, res) => {
  try {
    // File uploaded successfully

    // Get the URL of the uploaded image
    const imageUrl = `https://kranti2023.s3.ap-south-1.amazonaws.com/${req.file.key}`;

    // Save the URL to MongoDB or perform any other desired operations
    const newProduct = new productModel({
      subject : req.body.subject,
      title : req.body.title,
      description : req.body.description,
      link : req.body.link,
      image:imageUrl
    });

    await newProduct.save();

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save the URL' });
  }
});



router.post("/sendproduct", function(req,res){
  productModel.find(function (error, products) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(products);
    }
  });
})



router.get("/allproduct",function(req,res){
  try {
    productModel.find().then(function(products){
      res.send(products)
    })
  } catch (error) {
    console.log(error);
  }
})

//===========================for modules====================================//

router.get('/module',function(req,res){
  try {
    res.render("module");
    
  } catch (error) {
    console.log(error)
  }
  
})

router.get('/showmodule',function(req,res){
  try {
    res.render("showmodule");
    
  } catch (error) {
    console.log(error)
  }
  
})


router.post('/module', upload.single('image'), async (req, res) => {
  try {
    // File uploaded successfully

    // Get the URL of the uploaded image
    const imageUrl = `https://kranti2023.s3.ap-south-1.amazonaws.com/${req.file.key}`;

    // Save the URL to MongoDB or perform any other desired operations
    const newModule = new moduleModel({
      image:imageUrl,
      topic : req.body.topic,
      title : req.body.title,
      description : req.body.description,
      link : req.body.link,
      productid:req.body.productid,
      
    });

    await newModule.save();

    res.json({ success: true, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to save the URL' });
  }
});


// router.post("/sendmodule", function(req,res){
//   moduleModel.find({_id:req.body.productid},function (error, modules) {
//     if (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } else {
//       res.json(modules);
//     }
//   });
// })


router.post('/sendmodule', function (req, res) {
  const productId = req.body.productid;
  
  const ObjectId = mongoose.Types.ObjectId;
  const query = { productid: ObjectId(productId) };

  moduleModel.find(query).then(function (modules) {
    res.json(modules);
  }).catch(function (error) {
    console.error(error);
    res.sendStatus(500);
  });
});


router.get("/allmodule",function(req,res){
  try {
    moduleModel.find().then(function(modules){
      res.send(modules)
    })
    
  } catch (error) {
    console.log(error);
  }
})



















// router.post('/register',function(req,res,next){
//   var data = new userModel({
//     // name : req.body.name,
//     username : req.body.username,
//     // email : req.body.email
//   })

//   userModel.register(data,req.body.password)
//   .then(function(createdUser){
//     passport.authenticate("local")(req,res,function(){
//       res.redirect("/login");
//     })
//   })
// })




const jwt = require('jsonwebtoken');
router.post('/register', function (req, res, next) {
  var data = new userModel({
    username: req.body.username,
  });

  userModel.register(data, req.body.password)
    .then(function (createdUser) {
      passport.authenticate("local")(req, res, function () {
        const token = jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET_KEY);
        res.status(200).json({ message: "Registration successful" , token});
      });
    })
    .catch(function (error) {
      res.status(500).json({ error: "Registration failed" });
    });
});








// router.post("/login" , passport.authenticate("local" ,{
//   successRedirect: "/profile",
//   failuRedirect: "/login"
// }) , function(req,res,next){ } ) ;


router.post("/login", function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) {
      console.log('Error during login:', err);
      return res.status(500).json({ error: "Error during login" });
    }

    if (!user) {
      console.log('Login failed:', info.message);
      return res.status(401).json({ error: "Login failed" });
    }

    req.logIn(user, function(err) {
      if (err) {
        console.log('Error during login:', err);
        return res.status(500).json({ error: "Error during login" });
      }

      console.log('Login successful:', user);
      // req.session.user = user;
      globalUser = user;
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY);
      
      return res.status(200).json({ message: "Login successful" ,token});
    });
  })(req, res, next);
  
});








router.get("/logout",function(req,res){
  req.logout(function(err){
    if(err){ return next(err);}
    res.redirect('/');
  });
})

function isloggedin(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }

  else{
    res.redirect("/login");
  }
}



module.exports = router;
