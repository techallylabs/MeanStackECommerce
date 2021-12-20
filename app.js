const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

require('dotenv/config');

//routers
const productRouter = require('./routers/products');
const userRouter = require('./routers/users');
const orderRouter = require('./routers/orders');
const categoryRouter = require('./routers/categories');

//middleware
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use("/public/uploads",express.static(__dirname+'/public/uploads'));
app.use(errorHandler);

const api=process.env.API_URL

app.use(`/${api}/products`,productRouter);
app.use(`/${api}/users`,userRouter);
app.use(`/${api}/categories`,categoryRouter);
app.use(`/${api}/orders`,orderRouter);

mongoose.connect(process.env.DATABASE_CONNECTION_STRING).then(() => {
    console.log("Database connection is ready");
})


app.listen(3000, ()=> {
    console.log("Server is runing now at http://localhost:3000");
})