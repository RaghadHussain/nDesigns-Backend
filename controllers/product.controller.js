const Product = require('../models/Product')
const Category = require('../models/Category')

async function createProduct(req, res) {
    const { name, description, category } = req.body
    const images = req.files && req.files.length ? req.files.map(file => `/uploads/${file.filename}`) : undefined;

    try {
        const createdProduct = await Product.create({ name, images, description, category })
        res.status(201).json(createdProduct)
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Product with this name already exists.' })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getAllProducts(req, res) {
    try {
        const products = await Product.find()
        res.status(200).json(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getProductById(req, res) {
    try {
        const foundProduct = await Product.findById(req.params.id)
        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found.' })
        }
        res.status(200).json(foundProduct)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateProduct(req, res) {
    const { name, description, category } = req.body

    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }

        const images = req.files && req.files.length
            ? req.files.map(file => `/uploads/${file.filename}`)
            : product.images

        
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
            { name, images, description, category },
            { new: true, runValidators: true })
        res.status(200).json(updatedProduct)
    } catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function deleteProduct(req, res) {
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' })
        }
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: 'Product deleted successfully.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function search(req, res) {
    try{
        const query = req.query.q

        if(!query){
            return res.json([])
        }

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

        const matchingCategories = await Category.find({
            name: { $regex: escapedQuery, $options: "i" }
        }).select('_id')

        const categoryIds = matchingCategories.map(c => c._id)

        const results = await Product.find({
            $or: [
                { name: { $regex: escapedQuery, $options: "i" } },
                { description: { $regex: escapedQuery, $options: "i" } },
                { category: { $in: categoryIds } }
            ]
        }).populate('category', 'name')

        res.status(200).json(results)
    }catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }

}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    search
}