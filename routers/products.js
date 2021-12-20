const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require("multer");

const {Product} = require("../models/products")
const {Category} = require("../models/categories")

const File_Type_Map = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = File_Type_Map[file.mimetype];
        let uploadError = new Error("File Type is invalid");
        if(isValid){
            uploadError=null;
        }
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
       const fileName = file.originalname.split(" ").join("-");
       const file_extension = File_Type_Map[file.mimetype];
       cb(null, `${fileName}-${Date.now()}-${file_extension}`);
    }
  })
  
const upload_options = multer({ storage: storage })

router.get(`/`, async (req,res) => {
    let filter = {};
    if(req.query.categories){
        filter = {categories: req.query.categories.split(",")};
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success:false})
    }
    res.send(productList);
  })

router.get(`/:id`, async (req,res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).send("Could not find the product");
    }
    res.send(product);
  })

router.put(`/:id`, async (req,res) => {
    //Check if a valid category first.
    console.log(req.body)
    const category = await Category.findById(req.body.category)
    if(!category){
        res.status(400).send("Invalid Category");
        return;
    }

    //Check if the id is valid
    if (mongoose.isValidObjectId(req.params.id)){
        res.status(400).send("Object id is invalid");
    }

    //Check if id is an actual product
    const product = Product.findById(req.params.id)
    if(!product){
        res.status(400).send("Not a product id");
    }
    let image_path;
    if(req.file){
        const fileName= req.file.filename
        const basepath = `${req.protocol}://${req.get("host")}/public/upload/`
        image_path = `{base_path}{fileName}`
    }else{
        image_path = product.image;
    }

    //update the product
    Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        image:image_path,
        countinStock: req.body.countInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }).then((createdProduct => {
        console.log("Created Product: ",createdProduct);
        res.status(201).json(createdProduct);
    })).catch((err) => {
        console.log(err);
        res.status(500).json({
            error:err,
            success:false
        })
    })
  })  
  
router.post(`/`, upload_options.single('image'), async (req,res) => {
    const category = await Category.findById(req.body.category)
    if(!category){
        return res.status(400).send("Invalid Category");
        
    }
    if(!req.file){
        return res.status(400).send("Please include the file attachment");
    }

    const fileName= req.file.filename
    const basepath = `${req.protocol}://${req.get("host")}/public/upload/`
    const newProduct = new Product({
        name: req.body.name,
        image: `${basepath}${fileName}`,
        countInStock: parseInt(req.body.countInStock),
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: parseInt(req.body.price),
        category: req.body.category,
        rating: parseInt(req.body.rating),
        numReviews: parseInt(req.body.numReviews),
        isFeatured: req.body.isFeatured
    });

    console.log(newProduct);

      newProduct.save().then((createdProduct => {
          console.log("Created Product: ",createdProduct);
          res.status(201).json(createdProduct);
      })).catch((err) => {
          console.log(err);
          res.status(500).json({
              error:err,
              success:false
          })
      })
  })

router.delete(`/:id`, (req,res) => {
    //Check if the object id is valid
    if( !mongoose.isValidObjectId(req.params.id) ){
        res.status(400).send("Object id is invalid");
    }

    //Delete the product
    Product.findByIdAndDelete(req.params.id, (err,docs) => {
        if(err){
            res.status(500).send("Could not delete the product");
        }else{
            res.status(200).send(docs);
        }
    })
  })

router.get("/get/count", async (req,res) => {
    const products = await Product.find();
    if(!products){
        res.status(400).send("Unable to retrieve product count");
    }
    
    return res.send({
        "product_count":products.length
    });
});

router.get("/get/featured/:count", (req,res) => {
    const count = req.params.count? req.params.count:100 ;
    console.log("Count: "+count);
    Product.find({isFeatured: true}, (err,result) => {
       if(err){
           res.status(400).send(err);
       }else{
           res.send(result);
       }
    }).limit(count);
})

router.put(`/gallery-images/:id`, upload_options.array('images',10), async (req,res) => {
    //Check if the id is valid
    if (mongoose.isValidObjectId(req.params.id)){
        res.status(400).send("Object id is invalid");
    }
    if(!req.files) {
        res.status(400).send("Please attach some files");
    }

    let imagePaths = []

    const basepath = `${req.protocol}://${req.get("host")}/public/upload/`

    req.files.map(file => {
    const basepath = `${req.protocol}://${req.get("host")}/public/upload/`
        imagePaths.push(`${basepath}${file.fileName}`);
    });

    //update the product
    Product.findByIdAndUpdate(req.params.id,{
        images: ""
    }).then((createdProduct => {
        console.log("Created Product: ",createdProduct);
        res.status(201).json(createdProduct);
    }))
})

  module.exports = router;