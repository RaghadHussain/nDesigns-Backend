const Address = require('../models/Address')

async function createNewAddress(req, res) {
    try {
        const { city, block, road, building, apartment, note } = req.body

        const createdAddress = await Address.create({
            userId : req.user._id,
            city, block, road, building, apartment, note
        })

        res.status(201).json(createdAddress)
    } catch (e) {
        if (e.code === 11000) {
            return res.status(409).json({ message: 'Address Already Exists for This User' })
        }
        res.status(500).json({ message: e.message })
    }
}



async function getUserAddress(req, res) {
    try {
        const userAddress = await Address.findOne({ userId: req.user._id })
        if (!userAddress) {
            return res.status(404).json({ message: 'No Address Found' })
        }
        res.status(200).json(userAddress)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
}

async function updateUserAddress(req, res) {
    try {
        const { city, block, road, building, apartment, note } = req.body
        const updateData = { city, block, road, building, apartment, note }

        const updatedAddress = await Address.findOneAndUpdate(
            {_id : req.params.id, userId: req.user._id},
            updateData,
            { new: true, runValidators: true })

            if(!updatedAddress){
                return res.status(404).json({ message: 'No Address Found' })
            }

        res.status(200).json(updatedAddress)
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
}

async function deleteUserAddress(req, res){
    try{
        const deletedAddress = await Address.findOneAndDelete({_id : req.params.id, userId: req.user._id})
        if(!deletedAddress){
                return res.status(404).json({ message: 'No Address Found' })
            }
        res.status(204).json(deletedAddress)
    }catch(e){
        res.status(500).json({ message: e.message })
    }
}



module.exports = {
    createNewAddress,
    getUserAddress,
    updateUserAddress,
    deleteUserAddress
}