//jshint esversion:6
//hao paste dotenv ni vai therng sot phc hai mun sa mard khao therng thouk package u loum dai
require('dotenv').config() //hao pai tham kan tit tung npm i dotenv. ern sai dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//hao tit tung 3 package ni phuam kun npm i passport passport-local passport-local-mongoose express-session
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//const md5 = require("md5");//npm i md5 mun pen hash function
//to ni mun si sai nai kan hn authen level2
//const encrypt = require("mongoose-encryption");//hao pai tham kan npm i mongoose-encryption kon

const app = express();
//pen kan bun thouk hai env khao therng khor moon API_KEY t u nai file .env vela hao run node man si hen key khg api_key
//to file .env kub gitignore ni man hao si tham kan keb api or key khao la hut y leo hao sa mard ern sai phuak mun u nar app.js dai
//vela hao git push code hao khuen github .env kub gitignore mun si br pai num pheua khuam pot phai khg khor moon hao
//console.log(md5("123456"));//vela hao click save nodemon ka si show pen hash key u terminal

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
//sai session
app.use(session({
  secret: "Our a little secret",//hao si tham kan keb khuam lub hao
  resave: false,//บังคับให้บันทึกเซสชันกลับไปยังที่เก็บเซสชัน แม้ว่าเซสชันจะไม่ถูกแก้ไขในระหว่างการร้องขอก็ตาม pokkati kha default man sai false
  saveUninitialized: false
}));
//hao si lerm ton session
app.use(passport.initialize());
app.use(passport.session());
//hao sai connect mongodb pheua hai si sang username and password
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
//mongoose.set("useCreateIndex", true);
//userSchema man hao aow vai tung kha houp bb user phu sai mai hao
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});
//hao sai passportmongoose man kan sai hash and salt doi t hao br tong khien hash and salt hai yak
userSchema.plugin(passportLocalMongoose);

//encrypt mun pen package kan khao la hut hai hao. code ni aow ma jak mongoose-encrypt search nai gg
//encryptedFields: ["password"] man hai mun encrypt sa phc tae password vela t hao register sai email$password leo
//hao khao pai check bg nai mongoCampas man mun si hen tae mail hao suan password man mun si pen encrypt to nung sue yao2
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//hao tham kan sang User to phim yai hai mun mee kha == userSchema maiy khuam va User si mee properties khue userSchema 
//man email:string, password:string
//ni man hao sang phu sai khn t1 User leo mun si keb vai nai userDB
const User = new mongoose.model("User", userSchema)
//un ni hao si sang new mongoose schema mai doi sai passport
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function(req, res){
    res.render("home");
});
//vela hao click icon login mun ka si deng pai route login
app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});
//ni man thar user login u leo hao si show nar secrets
app.get("/secrets", function(req, res){
    if (req.isAuthenticated()) {//thar user mee kan phi soud to ton leo man hai show nar secrets
        res.render("secrets");
    } else {
        res.redirect("/login");//thar user br thun dai phi soud to ton or y thun login(authenticate) man mun si deng pai nar login
    }
});
//route logout hao mee tae kuad sob thar mee err show err thar br mee man hai kub pai nar home mai
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
//ni man kan long tha bien vela hao input mail and password mun si post song value pai pheua register
app.post("/register", function(req, res){
    //hao link mun kub passport mongoose
    User.register({username: req.body.username}, req.body.password, function(err, username){
        if (err) {
            console.log(err);
            res.redirect("/register");//thar mee err man mun si deng kub ma nar register pheua try again
        }else {//thar br mee err man hao si tung kha cookies t bun thuek session kan login pa ju bun
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
    })
    
    });
    
    //hao si ma sang to kuad sob kan login va nai la bob hao mee user ni leo br
    //vela t hao click poum login leo sai email&password man mun si khao pai nar screts dai to ni kor la ny hao register leo
    app.post("/login", function(req, res){
        //pen user input user and password
      const user = new User({
        username: req.body.username,
        password: req.body.password
      });
      //thar hao khery register leo man browser mun si bun thuek cookies user hao vai
      //leo hao ma login bard ni hao hai login mun pai dueng khor moon ma jak user u therng leo authenticate
      //bg va account t user input khao nar login ni khery register ma la br thar khery man mun si bun thuek vai
      //nai cookie khg browser mun ka ja sa mard login dai
        req.login(user, function(err){
            if (err) { 
                console.log(err);
            } else {//thar hao phi soud to ton pharn man mun si nam hao pai local t keb nar secrets vai
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                  })
            }
        })
    });






//function hash ni man sai saltRounds man mun si hash password hai hao auto lery tam jum nuan hob t hao set man 10
    //code ni aow ma jak bcrypt npm nai gg 
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     //sang sue phu sai mai
    // const newUser = new User({
    //     //hao sai req.body.name man hai user mai sa mard phim email&password tam jai long nai form register
    //     //doi form email hao si refer name phc hao set name khg form email man username nai page register
    //       email: req.body.username,
    //       password: hash
    //       //password: md5(req.body.password)//ton hao register leo input password hao si pien password pen hash func bb yon kub br dai
    //     });
    //     //ni pen kan save user mai t dai register
    //     //thar err show err thar br err hai pai nar secrets dai
       
    //     //to ni man function save version mai to khg angela yu man kao leo
    //     //lung jak t hao register leo click register email&password mun si thuek save vai nai mongoCompase hao lery
    //         newUser.save().then(()=>{
    //             res.render("secrets");
    //         }).catch((err)=>{
    //             console.log(err);
    //         })
    //     });

        



app.listen(3000, function() {
    console.log("Server started on port 3000.");
});