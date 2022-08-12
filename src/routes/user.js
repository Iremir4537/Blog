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
 if (req.body.password.length <= 7) {
   res.status(400).json({
     message: "Password must be at least 7 characters long",
    });
  }
  //Password must contain at least 1 upper and lower cased characters
  
  //Email must be valid
  if(!validator.isEmail(req.body.email)){
    res.status(400).json({
      message: "Please enter a valid Email"
    })
  }
  //Minimum 3 letters long
  try {
    bcrypt.hash(req.body.password, 8, async (err, hash) => {
      try {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
        });
        await user.save();
        res.send(user);
      } catch (e) {
        res.send({ error: "Something went wrong please try again!" });
      }
    });
  } catch (e) {
    res.send({ error: "Something went wrong please try again!" });
  }
});

router.post("/api/user/login", async (req,res) => {
    try {
       const  user = await User.findOne({email:req.body.email})
        if(user == null){
            throw new Error()
        }
        bcrypt.compare(req.body.password,user.password, function(err,result) {
           try {
                if(!result == true){
                    throw new Error();
                }
                else{
                   const token = jwt.sign({name:user.name,email:user.email}, process.env.TOKENKEY);
                   res.cookie("SESSION",token,{expiresIn:"24h"})
                    res.send("Success")
                }
           } catch (e) {
               res.send({ error: "Something went wrong please try again!" });
           }
        })
    } catch (e) {
        res.send({ error: "Something went wrong please try again!" });
    }
})

router.post("/api/user/logout", async (req,res) => {
  try {
    res.clearCookie("SESSION");
    res.send();
  } catch (e) {
    res.send({ error: "Something went wrong please try again!" });
  }

})

router.get("/api/user/getposts/:id", async (req,res) => {
  try {
    const user = await User.findById(req.params.id);
    await user.populate("posts");
    res.send(user.posts);
  } catch (e) {
    res.send({ error: "Something went wrong please try again!" });
  }
})

module.exports = router;