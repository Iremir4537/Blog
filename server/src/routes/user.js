const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const validator = require("validator");

require("dotenv").config();


router.post("/api/user/create", async (req, res) => {

 //Password minimum 7 letters long
 if (req.body.password.length < 7) {
   res.status(400).json({
     message: "Password must be at least 7 characters long",
    });
    return
  }
  //Password must contain at least 1 upper and lower cased characters

let hasLower;
let hasUpper;
let hasNumber;
  for (let i = 0; i < req.body.password.length; i++) {
      hasLower=false;
      hasUpper=false;
      hasNumber=false;
      if(req.body.password[i] == req.body.password[i].toUpperCase()){
        hasUpper = true
      }
      if (req.body.password[i] == req.body.password[i].toLowerCase()) {
        hasLower = true;
      }
      if (typeof(parseInt(req.body.password[i],10)) == "number") {
        hasNumber = true;
      }
  }
    if(!hasLower || !hasNumber || !hasUpper){
    res.status(400).json({
      message: "Password must contain numbers and 1 Lower 1 Upper case characters!",
    });
    return
  }

  //Email must be valid
  if(!validator.isEmail(req.body.email)){
    res.status(400).json({
      message: "Please enter a valid Email"
    })
    return
  }
  
  //Minimum 3 letters long
  if(req.body.name.length <3){
    res.status(400).json({
      message: "Name must be at least 3 letters long",
    });
    return;
  }
//Email must not be in the database
  const x = await User.find({ email: req.body.email });
  if(x == []){
    res.status(400).json({
      message: "Email is already in use",
    });
    return;
  }

  try {
    bcrypt.hash(req.body.password, 8, async (err, hash) => {
      try {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
        });
        await user.save();
        res.status(201).json({
          message:"Account is registered"
        });
      } catch (e) {
          res.status(500).json({
            message:"Something went wrong please try again"
          })
          return
      }
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong please try again",
    });
    return;
  }
});

router.post("/api/user/login", async (req,res) => {
    try {
       const  user = await User.findOne({email:req.body.email})
        if(user == null){
            res.status(400).json({
              message:"Email doesn't exist"
            })
            return
        }
        bcrypt.compare(req.body.password,user.password, function(err,result) {
           try {
                if(!result == true){
                    res.status(400).json({
                      message: "Password is incorrect",
                    });
                    return
                }
                else{
                   const token = jwt.sign({name:user.name,email:user.email}, process.env.TOKENKEY);
                    res.status(200).json({
                      message:"Login is succesfull",
                      token
                    })
                    return
                }
           } catch (e) {
              res.status(500).json({
                message: "Something went wrong please try again",
              });
              return;
           }
        })
    } catch (e) {
      res.status(500).json({
        message: "Something went wrong please try again",
      });
      return;
    }
})

router.post("/api/user/logout", async (req,res) => {
  try {
    res.clearCookie("SESSION");
    res.status(200).json({
      message:"Successfully logged out"
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong please try again",
    });
    return;
  }

})

router.get("/api/user/getposts/:id", async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate("posts");
    res.status(200).json({
      posts:user.posts
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong please try again",
    });
    return;
  }
})

module.exports = router;