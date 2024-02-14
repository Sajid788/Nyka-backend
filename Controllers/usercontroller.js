const express = require('express');
const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/db');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const userController = express.Router();
const upload = multer({ dest: 'uploads/' }); 

cloudinary.config({ 
    cloud_name: 'drwx1h1u6', 
    api_key: '273633911698287', 
    api_secret: 'en2rrDJOSI2Ix_efomeLnR0VBjE' 
});

const uploadAvatar = async (file) => {
    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url;
};

// Signup 
userController.post('/register', upload.single('avatar'), async (req, res) => {
    const { name, email, password } = req.body;
    const avatar = req.file ? await uploadAvatar(req.file) : ''; 
    if (!name || !email || !password) {
        return res.status(400).send({ msg: 'Please fill all the details!!' });
    }
    try {
        const emailExist = await UserModel.findOne({ email });
        if (emailExist) {
            return res.status(400).send({ msg: 'User Already exists!! Please login' });
        }
        bcrypt.hash(password, 5, async (err, hash) => {
            if (err) {
                return res.status(500).send({ msg: 'Something went wrong' });
            }
            try {
                const user = await UserModel.create({
                    name,
                    avatar,
                    email,
                    password: hash
                });
                res.status(201).send({ msg: 'User Created!!' });
                console.log(user);
            } catch (error) {
                console.log(error);
                res.status(500).send({ msg: 'Something went wrong' });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: 'Something went wrong' });
    }
});

// Login
userController.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ msg: 'Please fill all the details' });
    }
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).send({ msg: 'Please Signup first!!' });
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result) {
                const token = jwt.sign({ userId: user._id }, JWT_SECRET);
                return res.status(201).send({
                    msg: "login successful",
                    userData: {
                        token,
                        name: user.name
                    }
                });
            } else {
                res.status(401).send({ msg: 'Wrong Credentials!!' });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: 'Something went wrong' });
    }
});

module.exports = userController;
