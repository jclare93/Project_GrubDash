const path = require("path");
const { runInNewContext } = require("vm");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishIdIsValid (req, res, next) {
    const {dishId} = req.params
    const foundDish = dishes.find((dish) => dish.id === dishId)
    if (foundDish) {
        res.locals.dish = foundDish
        next()
    } else {
        next({
            status: 404,
            message: `Dish does not exist: ${dishId}`
        })
    }
}

//makes sure the ids are valid for the update
function updateIsValid (req, res, next){
    const {dishId} = req.params
    const {data: {id} = {}} = req.body
    if (id){
        if(id === dishId){
            return next()
        }
        else{
           return next({
                status: 400, 
                message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
            })
        }
    }
    return next()
}

//checks dish name validity
function nameIsValid (req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name && name.length > 0) {
    return next();
    }
    next({
    status: 400,
    message: "Dish must include a name",
    });
}

//validates description 
function descriptionIsValid (req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description && description.length > 0) {
    return next();
    }
    next({
    status: 400,
    message: "Dish must include a description",
    });
}

//validates image url
function imageUrlIsValid (req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if (image_url && image_url.length > 0) {
    return next();
    }
    next({
    status: 400,
    message: "Dish must include a image_url",
    });
}

//checks to make sure a price for the dish is valid
function priceIsValid (req, res, next){
    const { data: { price } = {} } = req.body;
    if (!Number.isInteger(price)){
        next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0",
        })
    }
    if (price && price > 0) {
    return next();
    }
    if (price <= 0){
        next({
        status: 400,
        message: "Dish must have a price that is an integer greater than 0",
        })
    }   
    if (!price) {
        next({
            status: 400,
            message: "Dish must include a price",
        })
    }
}
//create function for adding an new dish
function create(req, res) {
    const {data: {name, description, price, image_url} = {}} = req.body;
    const newId = nextId()
    const newDish = {
        id: newId,
        name, 
        description, 
        price,
        image_url 
    }
    dishes.push(newDish)
    res.status(201).json({ data: newDish });
}

//reads the dish data given a dishId
function read(req, res, next){
    res.json({ data: res.locals.dish })
}

function update(req, res) {
    const dish = res.locals.dish
    const {data: {name, description, price, image_url} = {}} = req.body;
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
    res.json({data: dish})
}

//don't need to destroy
/*function destroy (req, res, next) {
    const {dishId} = req.params
    const index = dishes.findIndex((dish) => dish.id = dishId)
    dishes.splice(index, 1)
    res.sendStatus(204);
}*/

//lists all dishes
function list(req, res){
    res.json({data: dishes})
}

module.exports = {
create: [nameIsValid, descriptionIsValid, imageUrlIsValid, priceIsValid, create], 
read: [dishIdIsValid, read], 
update: [dishIdIsValid, nameIsValid, descriptionIsValid, imageUrlIsValid, priceIsValid, updateIsValid, update], 
list,
}
