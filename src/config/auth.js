const jwt = require('jsonwebtoken');
const prisma = require('../config/DbConfig');
const SECRET = process.env.SECRET

const Authentication = async (req, h) => {
    try {
        const token = req.headers.authorization;
        // console.log(token)

        if (!token) {
            return h.response({ status: 400, message: "Unauthorized! Missing authentication." }).takeover();
        } else {
            const verifytoken = jwt.verify(token, SECRET);
            // console.log("Token verification : ", verifytoken)


            const rootUser = await prisma.user.findFirst({ where: { email: verifytoken.email } });
            // console.log("Root_User", rootUser)


            if (!rootUser) {
                return h.response({ success: false, message: "User not found" }).code(404);
            };

            // console.log(token,rootUser);

            req.token = token
            req.rootUser = rootUser
            req.userId = rootUser.id

            return req
        }

    } catch (error) {
        console.log('Authentication error:', error);
        return h.response({ message: "Unauthorized User!", error }).code(400);
    }
}

module.exports = {
    Authentication
}