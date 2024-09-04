const prisma = require("../config/DbConfig")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET
const fs = require('fs');
const path = require('path');

// User login with email
const userLogin = async (req, h) => {
    try {
        const { email, password } = req.payload;

        const user = await prisma.user.findFirst({
            where: {
                email: email,
                deleted_at: null,
            },
            include: {
                Goal: true,
            },
        });
        if (!user) {
            return h.response({ message: "User not found" }).code(404);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return h.response({ message: "Invalid password" }).code(400);
        }
        const token = jwt.sign({ email: user.email }, SECRET, {
            expiresIn: "1d"
        });
        const hasGoals = user.Goal.length > 0;

        return h.response({
            success: true, message: "Login sucessfully",
            token: token,
            hasGoals: hasGoals,
            data: user,
        }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while user login", error }).code(500);
    }
};

// user profile
const userProfile = async (req, h) => {
    try {
        const user = req.rootUser;

        const userProfileData = await prisma.user.findFirst({
            where: {
                email: user.email,
                deleted_at: null,
            }
        });

        return h.response({ success: true, message: "User profile fetched successfully", data: userProfileData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while fetching user profile.", error }).code(500);
    }
};

// update user profile
const editUserProfile = async (req, h) => {
    try {
        const user = req.rootUser;

        const { name, contact_no, isd_code, whats_app_number, location, date_of_birth, profile_image } = req.payload;

        // Fetch current user profile to get existing profile image
        const currentUserProfile = await prisma.user.findUnique({
            where: { id: user.id },
            select: { profile_image: true }
        });

        // Prepare to delete the existing profile image if there is one
        if (currentUserProfile && currentUserProfile.profile_image) {
            const existingImagePath = path.join(__dirname, "..", "uploads", currentUserProfile.profile_image);
            if (fs.existsSync(existingImagePath)) {
                fs.unlinkSync(existingImagePath); // Delete the existing image
            }
        }

        let uniqueFilename = currentUserProfile.profile_image; // Default to existing filename if no new image
        if (profile_image && profile_image.hapi && profile_image.hapi.filename) {
            const uploadDir = path.join(__dirname, "..", "uploads");
            uniqueFilename = `${Date.now()}_${profile_image.hapi.filename}`;
            const uploadPath = path.join(uploadDir, uniqueFilename);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileStream = fs.createWriteStream(uploadPath);
            profile_image.pipe(fileStream);
        }

        const userProfileData = await prisma.user.update({
            where: {
                id: user.id,
                deleted_at: null,
            },
            data: {
                name,
                contact_no,
                isd_code,
                whats_app_number,
                location,
                date_of_birth,
                profile_image: uniqueFilename,
            }
        });
        return h.response({ success: true, message: "User profile updated successfully", data: userProfileData }).code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while editing user profile.", error }).code(500);
    }
}

module.exports = {
    userLogin,
    userProfile,
    editUserProfile,
}