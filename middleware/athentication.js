const { verify } = require("jsonwebtoken");
const user = require("../model/user");

const validateToken = async (req, res, next) => {
    const token = await req.header("accessToken");
    // console.log(token)
    if (!token) {
        // console.log("hii")
        return res.json({ message: "User Is not Loged In" });
    }
    try {
        verify(token, "secret", async (err, decode) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            const userData = await user.findOne({ _id: decode.data });

            if (userData) {
                req.user = userData._id;
                // console.log(req.id)
                next();
            }
            else {
                res.json({ message: "User Athentication Failed" })
            }
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }

}

module.exports = { validateToken };