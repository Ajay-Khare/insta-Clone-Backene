const express = require("express");
const router = express.Router();
router.use(express.json());
const bodyparser = require("body-parser")

const post = require("../model/post");
const fs = require("fs")
const path = require("path")
const { body, validationResult } = require('express-validator');
const user = require("../model/user")
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const { validateToken } = require("../middleware/athentication")
const cloudinaryModule = require('cloudinary');
const cloudinary = cloudinaryModule.v2;


cloudinary.config({
    cloud_name: "dwuxgvpzw",
    api_key: '239173321841687',
    api_secret: 'uMlUaTDzMV4BO1VO9gf39NmR_B8'
})

router.post("/register",
    body('email').isEmail(),
    body('password').isLength({ min: 6, max: 16 }),
    body("name").isLength({ min: 3 }),
    async (req, res) => {

        try {
            const errors = validationResult(req);
            const { name, password, email } = req.body;
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const data = await user.find({ email })
            if (data.length !== 0) {
                return res.status(500).send({ message: "User is Allready Registered" })
            }
            bcrypt.hash(password, 10, async function (err, hash) {
                if (err) {
                    return res.send(err.message)
                }
                const newUser = await user.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                })
                res.status(200).json({ message: "Success" });
            });
        } catch (error) {
            res.status(400).send(error.message);
        }
    })

router.post("/login",
    body('email').isEmail(),
    body('password').isLength({ min: 6, max: 16 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const userArrey = await user.find({ email: email })
        const userObj = await user.findOne({ email })
        if (userArrey.length === 0) {
            return res.status(500).json({ message: "USER NOT REGISTERED" })
        }
        hash = userObj.password;
        bcrypt.compare(password, hash, async function (err, result) {
            if (err) {
                res.status(400).send(err.message)
            }
            if (!result) {
                res.status(400).json({ message: "Incorrect Password" })
            }
            if (result) {
                token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    data: userObj._id
                }, 'secret');
                res.status(200).json({ message: "Success", token })
            }
        });
    })



router.get("/feeds", validateToken, async (req, res) => {

    try {
        const postData = await post.find().sort({ _id: -1 });
        if (postData.length == 0) {
            const data = fs.readFileSync(path.join(__dirname, "../data.json"), "utf-8", (err, data) => {
                if (err) {
                    console.log(err.message);
                }
                else {
                    console.log(" reading successful")
                }
            })
            const userData = JSON.parse(data).user
            userData.map(async (ele) => {
                await post.create({
                    name: ele.name,
                    location: ele.location,
                    likes: ele.likes,
                    PostImage: ele.PostImage,
                    description: ele.description,
                    date: ele.data
                })
            })
            const newData = await post.find().sort({ _id: -1 });
            res.status(200).send(newData);
        }
        else {
            res.status(200).send(postData);
        }
    } catch (error) {
        console.log(error.message)
    }
})

router.post("/post", validateToken, async (req, res) => {
    try {
        const { location, description, PostImage } = req.body;
        const userData = await user.findOne({ _id: req.user });
        if (userData) {
            const image = await cloudinary.uploader.upload(PostImage,
                { upload_preset: "new-post" },
                // (error, result) => {
                //     console.log(result, error);
                // }
            );
            const postData = await post.create({
                name: userData.name,
                location,
                description,
                PostImage: image.url,
                userID: req.user
            })
            res.status(200).json({ message: "success" })
        }

    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})


router.put("/remove", validateToken, async (req, res) => {
    try {
        const id = req.body.id;
        const data = await post.findOne({ _id: id })
        if (req.user.toString() === data.userID.toString()) {
            const remove = await post.deleteOne({ _id: id })
            res.status(200).json({ message: "success" })
        }
        else {
            res.status(500).json({ message: "invalid user" })

        }
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post("/like", async (req, res) => {
    const { id, like } = req.body
    // const like = req.body.like;
    // const id = req.body.id;
    const postLikes = await post.findOne({ _id: id })
    const oldlike = postLikes.likes;
    const newLikes = oldlike + like
    const updatedPodtLikes = await post.updateOne({ _id: id }, { likes: newLikes })
    const updatedData = await post.findOne({ _id: id });
    res.json({ message: "success", updatedData })
})

router.get("*", validateToken, (req, res) => {
    res.redirect("/feeds")
})

module.exports = router;