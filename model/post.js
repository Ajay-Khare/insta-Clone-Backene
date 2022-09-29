var mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    name: { require: true, type: String },
    location: { require: true, type: String },
    likes: { require: true, type: Number, default:0 },
    description: { require: true, type: String },
    PostImage: { require: true, type: String },
    date: { type: Date, default: new Date().toISOString().slice(0, 10) },
    userID: {type:mongoose.Schema.Types.ObjectId, ref:"user"}
})

const post = mongoose.model("post", postSchema);

module.exports = post;