const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors")
const router = require("./routers/router")
const port = process.env.PORT || 8080
const app = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use("/", router)


var mongoDB = 'mongodb+srv://Ajay:ajay@cluster0.69nrddt.mongodb.net/instagram?retryWrites=true&w=majority';
mongoose.connect(mongoDB, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log(err.message)
    }
    else {
        console.log("connected to DB");
    }
});



app.listen(port, () => {
    console.log(`server is runing on ${port}`)
})
