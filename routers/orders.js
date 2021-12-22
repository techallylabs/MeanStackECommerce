const express = require('express');
const router = express.Router();
const {Order} = require("../models/orders")
const {OrderItem} = require("../models/OrderItem")

router.get(`/`, async (req,res) => {
    const orderList = await Order.find().populate("user","name").sort({"dateOrdered":-1});
    if(!orderList){
        res.status(500).join({success:false})
    }
    res.send(orderList);
  });

  router.get(`/:id`, async (req,res) => {
    const orderList = await Order.findById(req.params.id).populate("user","name").populate({path: 'product', populate:'category'});
    if(!orderList){
        res.status(500).join({success:false})
    }
    res.send(orderList);
  })

  router.post('/', async (req,res) => {

    //Get Order Items
    order_item_ids = Promise.all(req.body.orderItems.map(async order_item => {
        const order_item_tbc = new OrderItem({
            quantity: order_item.quantity,
            product: order_item.product
        });
        const order_item_created = await order_item_tbc.save();
        return order_item_created._id;
    }));    
    const order_item_ids_resolved = await order_item_ids;

    //Compute total price
    const individual_order_item_prices = await Promise.all(order_item_ids_resolved.map(async order_item_id => {
        const order_item = await OrderItem.findById(order_item_id).populate("product","price");
        return order_item.product.price * order_item.quantity
    }));
        
    const total_price =  individual_order_item_prices.reduce((a,b)=> a+b);

    let new_order = new Order({
        orderItems: order_item_ids_resolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: total_price,
        user: req.body.user
    });
    new_order = await new_order.save();

    if(!new_order){
        res.status(404).send("order cannot be created")
    }else{
        res.send(new_order);
    }
})

router.put('/:id',  (req,res) => {
    const id = req.params["id"]
    Order.findByIdAndUpdate(id,{
        status: req.body.status
    }).then(order => {
        if(order){
            res.send(order);
        }else{
            res.status(400).send("Cannot update the order");
        }
    });  
})

router.delete(`/:id`, async (req,res) => {

    //Check if the order exists
    const order = await Order.findById(req.params.id);
    if(!order){
        return res.status(400).send("Cannot find the order");
    }

    //Delete the order
    Order.findByIdAndDelete(req.params.id).then(async order => {
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem);
            });
            return res.status(200).send("Order Deleted");
        }else{
            return res.status(400).send("Order id is not found");
        }
    }).catch(err => {
        console.log(err);
        return res.send({"error":err});
    });
  })

  router.get("/get/totalsales", async (req,res) => {
      const total_sales = await Order.aggregate([
            { 
                $group: {
                    _id: null,
                    totalSales: {$sum: "$totalPrice"}
                }
            }
      ]);
      if(total_sales){
          res.send({"total_sales": total_sales.pop().totalSales});
      }else{
          res.status(400).send("Cannot get the total");
      }
  })

router.get("/get/count", async (req,res) => {
    const order_count = await Order.countDocuments();
    console.log(order_count);
    if(!order_count){
        return res.status(400).send("Unable to retrieve the count");   
    }else{
        return res.send({"order count":order_count});
    }
});

router.get(`/getuserorders/:id`,async (req,res) => {
    const user_orders = await Order.find({"user": req.params.id}).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    });
    if(user_orders){
        res.send(user_orders);
    }else{
        res.send("User orders cannot be retrieved").status(400);
    }
});

module.exports = router;

