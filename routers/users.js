const express = require('express');
const router = express.Router();
const {User} = require("../models/Users")
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

router.get(`/`, async (req,res) => {
    const userList = await User.find().select("-passwordHash");
    if(!userList){
        res.status(500).send({success:false})
    }
    res.send(userList);
  })

router.get(`/:id`, async (req,res) => {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if(!user){
        res.status(500).send({success:false})
    }
    res.send(user);
  })

router.post('/', async (req,res) => {
    let user = new User({
        name: req.body.name,
        email:req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin
    });
   created_user = await user.save();
    if(!user){
        res.status(404).send("user cannot be created")
    }else{
        res.send(user);
    }
})

router.put("/:id", async (req,res)=>{
    const existing_user = await User.findById(req.params.id);
    if(!existing_user){
        return res.status(400).send("User not found");
    }
    let newPasswordHash;
    if(req.body.password){
        newPasswordHash = bcrypt.hashSync(req.body.password,10)
    }else{
        newPasswordHash = existing_user.passwordHash;
    }
    User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email:req.body.email,
        passwordHash: newPasswordHash,
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin
    }, {new:true}, (err,docs) => {
        if(err){
            return res.status(400).send(`Could not update because: ${err}`);
        }else{
            return res.send({"updated user": docs});
        }
    });
});

router.post("/login",async (req,res)=>{
    //verify if a valid user email first
    const searched_users = await User.find({email:req.body.email});
    if(searched_users.length == 0){
        res.status(400).send("User email not found");
        return;
    }
    const user = searched_users[0];
    const secret = process.env.secret;
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        {expiresIn: '1d'}
        )
        res.status(200).send({
            "email": req.body.email,
            "token": token
        });
    }else{
        res.status(400).send("password is wrong");
    }
});

router.get("/get/count", async (req,res) => {
    const userList = await User.find();
    if(!userList){
        res.status(400).send("Could not retrieve the count");
    }
    const userCount = userList.length
    return res.send({"Total Users: ":userCount});
});

router.delete(`/:id`, async (req,res) => {
    //Check if the object id is valid
    if( !mongoose.isValidObjectId(req.params.id) ){
        res.status(400).send("Object id is invalid");
    }

    //Delete the product
    const deleted_user = await User.findByIdAndDelete(req.params.id);
    if(deleted_user){
        res.status(200).send("User Deleted");
    }else{
        res.status(400).send("User id is not found");
    }
  })

  module.exports = router;

