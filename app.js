//jshint esversion:6
//hao paste dotenv ni vai therng sot phc hai mun sa mard khao therng thouk package u loum dai
require('dotenv').config() //hao pai tham kan tit tung npm i dotenv. ern sai dotenv
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");//npm i bcrypt
const saltRounds = 10;//man kan sang hash 10 theua pheau hai kan khao la hut hao pot phai tae mun ka h hai com h vrk nuk khuen
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
//hao sai connect mongodb pheua hai si sang username and password
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true})

//userSchema man hao aow vai tung kha houp bb user phu sai mai hao
const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});


//encrypt mun pen package kan khao la hut hai hao. code ni aow ma jak mongoose-encrypt search nai gg
//encryptedFields: ["password"] man hai mun encrypt sa phc tae password vela t hao register sai email$password leo
//hao khao pai check bg nai mongoCampas man mun si hen tae mail hao suan password man mun si pen encrypt to nung sue yao2
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//hao tham kan sang User to phim yai hai mun mee kha == userSchema maiy khuam va User si mee properties khue userSchema 
//man email:string, password:string
//ni man hao sang phu sai khn t1 User leo mun si keb vai nai userDB
const User = new mongoose.model("User", userSchema)
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

//ni man kan long tha bien vela hao input mail and password mun si post song value pai pheua register
app.post("/register", function(req, res){
    //function hash ni man sai saltRounds man mun si hash password hai hao auto lery tam jum nuan hob t hao set man 10
    //code ni aow ma jak bcrypt npm nai gg 
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        //sang sue phu sai mai
    const newUser = new User({
        //hao sai req.body.name man hai user mai sa mard phim email&password tam jai long nai form register
        //doi form email hao si refer name phc hao set name khg form email man username nai page register
          email: req.body.username,
          password: hash
          //password: md5(req.body.password)//ton hao register leo input password hao si pien password pen hash func bb yon kub br dai
        });
        //ni pen kan save user mai t dai register
        //thar err show err thar br err hai pai nar secrets dai
       
        //to ni man function save version mai to khg angela yu man kao leo
        //lung jak t hao register leo click register email&password mun si thuek save vai nai mongoCompase hao lery
            newUser.save().then(()=>{
                res.render("secrets");
            }).catch((err)=>{
                console.log(err);
            })
        });
    
    });
    
    //hao si ma sang to kuad sob kan login va nai la bob hao mee user ni leo br
    //vela t hao click poum login leo sai email&password man mun si khao pai nar screts dai to ni kor la ny hao register leo
    app.post("/login", function(req, res){
        //ni man username&password t hao dai register
        const username = req.body.username;
        //ton ni hao sai bcrypt hash hao jueng tham kan lob to md5 to kao ork leo thaen req.body.password pen fuction kan
        //t user tham kan input password sai bcrypt h bb ni vela hao login mun ja tong kun kub password t sai bcrypt
        const password = req.body.password;
        //vela hao login ka ka sai hash khue kun kub register pass regis kub pass login tong kun man login dai
        //const password = md5(req.body.password);

        //ni man code version mai khg mongodb thar sai to therng khg angela yu mun br dai mun err
        User.findOne({email:username})
    .then((foundUser) => {
        if(foundUser){
            //ni pen kan pieb thieb nai bcrypt hao sang function bcrypt ma leo aow password t user input ma
            //foundUser.password man hai foundUser khao pai check bg pass word nai tharn khor moon va tong kun br
            
            bcrypt.compare(password, foundUser.password, function(err, result) {
                if (result === true) {
                    res.render("secrets");
                }
            });
               
            }
   })
   .catch((error) => {
    console.log(err);
       res.send(400, "Bad Request");
   });
    })
       
    













app.listen(3000, function() {
    console.log("Server started on port 3000.");
});