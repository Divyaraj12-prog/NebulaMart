const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const { address } = require('framer-motion/client');
const jwt = require('jsonwebtoken');
const redis = require('../DB/redis');

async function registerUser(req, res) {

    try {
        const { username, email, password, fullname: { firstname, lastname }, role} = req.body;

        const isUserexists = await userModel.findOne({ $or: [{ username }, { email }] });

        if (isUserexists) {
            return res.status(409).json({ message: 'User with given username or email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash,
            fullname: { firstname, lastname },
            role:role || 'user'
        });

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        })

        return res.status(201).json({
            message: 'User registered successfully',
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            address: user.addressSchema
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal server error' });

    }
}

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const user = await userModel.findOne({
            $or: [{ username }, { email }]
        }).select('+password');
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 24 * 60 * 60 * 1000 });

        return res.status(200).json({message: 'Login successful', id: user._id, username: user.username, email: user.email, fullname: user.fullname, role: user.role, address: user.addressSchema });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getCurrentUser(req, res) {
    const user = req.user;
    return res.status(200).json({
        message: 'User info retrieved successfully',
        user:user
    })
}

async function logoutUser(req, res) {
    const token = req.cookies.token;
    if(token){
        await redis.set(`blacklist_${token}`, true, 'EX', 24 * 60 * 60);
    }

    res.clearCookie('token', {
        httpOnly: true,
        secure: true
    });

    return res.status(200).json({
        message: "Logout successful"
    })
}

async function getUserAddresses(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select('addressSchema');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
        message: 'Addresses retrieved successfully',
        addresses: user.addressSchema
    })
}

async function addUserAddress(req, res) {
    const userId = req.user.id;
    const { street, city, state, zip, country, pincode, isDefault } = req.body;
     
    const user = await userModel.findOneAndUpdate({ _id: userId }, {
        $push: {
            addressSchema: { street, city, state, zip, country, pincode, isDefault }
        }
    }, { new: true });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(201).json({
        message: 'Address added successfully',
        address: user.addressSchema[user.addressSchema.length - 1]
    })
}

async function deleteUserAddress(req, res) {
    const id = req.user.id;

    const { addressId } = req.params;
    const user = await userModel.findByIdAndUpdate(id, {
        $pull: {
            addressSchema: { _id: addressId }
        }
    }, { new: true });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
        message: 'Address deleted successfully',
        address: user.addressSchema
    });
}

module.exports = { registerUser, loginUser, getCurrentUser, logoutUser, getUserAddresses, addUserAddress, deleteUserAddress };

