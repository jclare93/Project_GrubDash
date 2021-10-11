const path = require("path");
const { resourceLimits } = require("worker_threads");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//makes sure we are given a vlid :orderId
function orderIdIsValid(req, res, next){
    const { orderId } = req.params
    let {data: {id} = {}} = req.body
    const foundOrder = orders.find((order) => order.id === orderId)
    if (foundOrder)  {
        if (id){
        res.locals.order = foundOrder
        return next()} 
        else {
            id = orderId
            res.locals.order = foundOrder
            return next()
        }
        } else {
        return next({
            status: 404,
            message: `Order does not exist: ${orderId}`
        })
    }
}

//validates dish quantity
function dishQuantityIsValid (req, res, next) {
    const {data: {dishes} = {}} = req.body
    for (let i = 0; i < dishes.length; i++){
        if (!Number.isInteger(dishes[i].quantity) || !dishes[i].quantity >0){
            return next({
                status: 400,
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            })
        }
    }
    return next()
}

//validates the address
function deliverToIsValid (req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo && deliverTo.length > 0) {
    return next();
    }
    next({
    status: 400,
    message: "Order must include a deliverTo",
    });
}

//checks to make sure mobile number is valid
function mobileNumberIsValid (req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber && mobileNumber.length > 0) {
    return next();
    }
    next({
    status: 400,
    message: "Order must include a mobileNumber",
    });
}

//checks to make sure the dishes data piece is valid and is an array
function dishesIsValid(req, res, next){
    const {data: {dishes} = {}} = req.body
    if (dishes) {
        if (Array.isArray(dishes) && dishes.length > 0) {
            return next()
        } else {
            return next({
                status: 400, 
                message: 'Order must include at least one dish'
            })
        }
    } else{
        return next({
            status: 400, 
            message: 'Order must include a dish'
        })
    }
}

//makes sure we are given a valid status
function statusIsValid(req, res, next) {
    const {data: {status} = {}} = req.body
    if (status === "delivered"){
        return next({
            status: 404, 
            message: 'A delivered order cannot be changed'
        })
    }
   if (status === ('pending' || 'preparing' || 'out-for-delivery')){
       return next()
   } else {
       return next({
           status: 400, 
           message: 'Order must have a status of pending, preparing, out-for-delivery, delivered'
       })
   }
}

//checks if id is given. if id is given then it make sure it matches
function routeOrderValidation(req, res, next) {
    const {orderId} = req.params
    const {data: {id} = {}} = req.body
    if (orderId === id || !id) {
        return next()
    } else {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        })
    }
}

//creates order given order details + assigns new order id
function create(req, res) {
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    const newId = nextId()
    const newOrder = {
        id: newId,
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder)
    res.status(201).json({data: newOrder})
}

//response with the data from the order given order id
function read(req, res) {
    res.json({data: res.locals.order})
}


//updates the old order with the new order details
function update (req, res) {
    const order = res.locals.order
    const {data: {deliverTo, mobileNumber, status, dishes} = {}} = req.body
    order.deliverTo = deliverTo
    order.mobileNumber = mobileNumber
    order.status = status
    order.dishes = dishes
    res.json({data: order})
}

//checks if status is pending for order then deletes it from orders array
function destroy(req, res, next) {
    const {orderId} = req.params
    const foundOrder = res.locals.order
    if (foundOrder.status == 'pending') {
    const index = orders.findIndex((order) => order.id === orderId)
    orders.splice(index, 1)
    res.sendStatus(204);}
    else {
        return next({
            status: 400,
            message: "An order cannot be deleted unless it is pending.",
          });
        }
    }

function list(req, res) {
    res.json({data: orders})
}


module.exports = {
    create: [deliverToIsValid, mobileNumberIsValid, dishesIsValid, dishQuantityIsValid, create], 
    read: [orderIdIsValid, read], 
    update: [deliverToIsValid, mobileNumberIsValid, dishesIsValid, dishQuantityIsValid, orderIdIsValid, routeOrderValidation, statusIsValid, update], 
    delete: [orderIdIsValid, destroy],
    list,
    }
