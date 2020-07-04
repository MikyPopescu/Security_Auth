//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require('express-session');
const passport =  require('passport');
const passportLocalMongoose = require("passport-local-mongoose"); //requires also passport-local



const app = express();

//access to env variables
//console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//session
app.use(session({
    secret: "My little secret",
    resave: false,
    saveUninitialized: false
}));

//set up passport
app.use(passport.initialize());

//use passport to set up session
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useUnifiedTopology:true,useNewUrlParser: true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose); //hash+salt passwords + save users in db

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] }); //encryption only for the password field

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
  });

app.get("/login", function(req, res){
    res.render("login");
  });

app.get("/register", function(req, res){
    res.render("register");
  });

  app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
  });

  app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/")
  });

app.post("/register",function(req,res){

    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash //md5(req.body.password)
    //     });
    
    //     newUser.save(function(err){
    //         if(err){
    //            console.log(err);
    //         }
    //         else{
    //             res.render("secrets")
    //         }
    //     });
    // });


    //Passport Local Mongoose:
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                //cookie that saves session id
                res.redirect("/secrets");
            });
        }
    })
  
});

app.post("/login",function(req,res){

  /*  const username = req.body.username;
    const password = req.body.password;             //md5(req.body.password);

    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                //if(foundUser.password === password){
                    bcrypt.compare(password,foundUser.password,function(err,result){
                        if(result === true){
                            res.render("secrets")
                         }
                    });
                   // res.render("secrets")
                //}
            }
        }
    });*/

    
    //Passport Local Mongoose:
    const user = new User({
        username:req.body.username,
        pasword:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    })

});


app.listen(8080, function() {
    console.log("Server started on port 8080");
  });