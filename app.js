//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;



const app = express();

//access to env variables
//console.log(process.env.SECRET);


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


mongoose.connect("mongodb://localhost:27017/userDB", {useUnifiedTopology:true,useNewUrlParser: true});


const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); //encryption only for the password field

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
  });

app.get("/login", function(req, res){
    res.render("login");
  });

app.get("/register", function(req, res){
    res.render("register");
  });

app.post("/register",function(req,res){

    bcrypt.hash(req.body.password,saltRounds,function(err,hash){
        const newUser = new User({
            email: req.body.username,
            password: hash //md5(req.body.password)
        });
    
        newUser.save(function(err){
            if(err){
               console.log(err);
            }
            else{
                res.render("secrets")
            }
        });
    });
  
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;             //md5(req.body.password);

    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                //if(foundUser.password === password){
                    bcrypt.compare(password,foundUser.password,function(err,result){
                        if(result===true){
                            res.render("secrets")
                         }
                    });
                   // res.render("secrets")
                //}
            }
        }
    });
});


app.listen(8080, function() {
    console.log("Server started on port 8080");
  });