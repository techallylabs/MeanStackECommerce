const express = require('express');
const router = express.Router();
const {Category} = require("../models/categories")

router.get(`/`, async (req,res) => {
    const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).join({success:false})
    }
    res.send(categoryList);
  })

  router.get(`/:id`,  (req,res) => {    
      const id = req.params["id"]
      Category.findById(id).then(category => {
         if(category){
             res.send(category);
         }
         else{
             res.status(400).json({
                 "success": false,
                 "error": "Could not find the id"
             })
         }
      });
  })

  router.put('/:id',  (req,res) => {
    const id = req.params["id"]
    Category.findByIdAndUpdate(id,{
        name: req.body.name,
        icon:req.body.icon,
        color: req.body.icon
    }).then(category => {
        if(category){
            res.send(category);
        }else{
            res.status(400).send("Cannot update the record");
        }
    });  
})

  router.post('/', async (req,res) => {
      let category = new Category({
          name: req.body.name,
          icon:req.body.icon,
          color: req.body.icon
      });
     created_category = await category.save();
      if(!category){
          res.status(404).send("category cannot be created")
      }else{
          res.send(category);
      }

  })

  router.delete('/:id', (req,res) => {
        Category.findByIdAndRemove(req.params.id).then(category => {
            if(category){
                res.status(200).json({status: true, message: "category deleted"});
            }else{
                res.status(400).json({status: false, message: "category could not be deleted as it wasn't found"});
            }
        }).catch(err => {
            res.status(500).json({status: false, message: err});
        })
  });
  
  module.exports = router;

