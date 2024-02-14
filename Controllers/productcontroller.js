const express = require('express')
const ProductModel = require('../Models/Product')
const authenticateUser = require('../Middleware/auth')
const { body, validationResult } = require('express-validator');
const productController = express.Router()

// Error Handle here
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error' });
  };
  
// Validation middleware here
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  };

// Get all products here
productController.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        
        let query = {};
    
        // Filtering category here
        if (req.query.category) {
          query.category = req.query.category;
        }
        
         // Filtering gender here
        if (req.query.gender) {
            query.gender = req.query.gender;
          }
    
        // Sorting here
        const sortOptions = {};
        if (req.query.sort) {
          sortOptions[req.query.sort] = req.query.order === "desc" ? -1 : 1;
        }
    
        // Searching with name here
        if (req.query.name) {
          query.name = { $regex: new RegExp(req.query.name, "i") };
        }
    
        query.createrId = req.userId;      
        const totalItems = await ProductModel.countDocuments(query);
        const totalPages = Math.ceil(totalItems / pageSize);
    
        const data = await ProductModel.find(query)
          .sort(sortOptions)
          .skip((page - 1) * pageSize)
          .limit(pageSize);
        
        res.status(200).json({
            data,
            page,
            totalPages,
            totalItems,
          });
      } catch (error) {
        next(error);
      }
  });

 // Get product by id here
  productController.get('/products/:id', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
      } catch (error) {
        next(error);
      }
  });

  // Create product here
  productController.post('/products',[
    body('name').notEmpty().isLength({ min: 1, max: 50 }),
    body('picture').notEmpty(),
    body('description').notEmpty(),
    body('gender').notEmpty().isIn(['male', 'female']),
    body('category').notEmpty().isIn(['makeup', 'skincare', 'haircare']),
    body('price').notEmpty().isNumeric()
  ], validate, authenticateUser, async (req, res) => {

    const { name, picture, description, gender, category, price } = req.body;
    try {
      const product = new ProductModel({ name, picture, description, gender, category, price });
      await product.save();
      res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
      next(error);
    }
  });
  

  // Update product

  productController.patch('/products/:id', authenticateUser,[
    body('name').notEmpty().isLength({ min: 1, max: 50 }),
    body('picture').notEmpty(),
    body('description').notEmpty(),
    body('gender').notEmpty().isIn(['male', 'female']),
    body('category').notEmpty().isIn(['makeup', 'skincare', 'haircare']),
    body('price').notEmpty().isNumeric()
  ], validate, async (req, res) => {


    const id = req.params.id
    const createrId = req.userId
    try {
        const user = await ProductModel.findByIdAndUpdate({_id: id, createrId },{...req.body,updated_at:Date.now()})
        if(user){
            res.status(204).json({ message:'Product Updated Successfully'}); 
            console.log(user)
        }
        else{
            return res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
  });
  

  //Delete Product

  productController.delete('/products/:id', authenticateUser, async (req, res) => {
    const id = req.params.id
    const createrId = req.userId
    try {
        const user = await ProductModel.findByIdAndDelete({_id: id, createrId })
        if(user){
            res.status(202).json({ message: 'Product deleted successfully' });
            console.log(user)
        }
        else{
            return res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        next(error);
    }
  });

  productController.use(errorHandler);

  module.exports = productController