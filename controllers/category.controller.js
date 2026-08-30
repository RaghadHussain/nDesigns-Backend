const Category = require('../models/Category')
const Product = require('../models/Product')

async function createCategory(req, res) {
    const { name, parentCategory } = req.body
    try {
        if (parentCategory) {
            const parent = await Category.findById(parentCategory)
            if (!parent) {
                return res.status(400).json({ message: 'Parent category not found.' })
            }
        }
        const createdCategory = await Category.create({ name, parentCategory })
        res.status(201).json(createdCategory)

    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Category with this name already exists.' })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function getAllCategories(req, res) {
    try {
        const allCategories = await Category.find().populate('parentCategory', 'name')
        res.status(200).json(allCategories)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getCategoryById(req, res) {
    try {
        const foundCategory = await Category.findById(req.params.id)
        if (!foundCategory) {
            return res.status(404).json({ message: 'Category not found.' })
        }
        res.status(200).json(foundCategory)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateCategory(req,res){
    const {name} = req.body
    try{
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id,
            {name}, {runValidators: true, new: true}
        )
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found.' })
        }
        res.status(200).json(updatedCategory)

    }catch(err){
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Category with this name already exists.' })
        }
        res.status(500).json({message: 'Internal Server Error.'})
    }
}

async function deleteCategory(req,res){
    try{
        const category = await Category.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ message: 'Category not found.' })
        }

        const childCategory = await Category.findOne({ parentCategory: req.params.id })
        if (childCategory) {
            return res.status(409).json({ message: 'Cannot delete a category that has subcategories.' })
        }

        const productInCategory = await Product.findOne({ category: req.params.id })
        if (productInCategory) {
            return res.status(409).json({ message: 'Cannot delete a category that has products assigned to it.' })
        }

        await Category.findByIdAndDelete(req.params.id)
        res.status(200).json({message: 'Category deleted successfully.'})

    }catch(err){
        console.log(err)
        res.status(500).json({message: 'Internal Server Error.'})

    }
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}