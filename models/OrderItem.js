mongoose = require("mongoose");

OrderItemSchema = mongoose.Schema({
    quantity:  {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});

module.exports.OrderItem = mongoose.model("OrderItem",OrderItemSchema);
