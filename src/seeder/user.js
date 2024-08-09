const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();
const prisma = new PrismaClient();

const userSeed = async () => {
    const email = 'test@123.com';
    const password = 'password';
    const mobile = '7003957953';
    const isdCode = "+91";

    try {
        const userExists = await prisma.user.findFirst({
            where: {
                email: email,
                deleted_at: null,
            }
        });

        if (userExists) {
            console.log("User already exists");
            return;
        }

        const userData = await prisma.user.create({
            data: {
                name: 'Test_User',
                email: email,
                contact_no: mobile,
                isd_code: isdCode,
                whats_app_number: mobile,
                location: "Kolkata",
                password: await bcrypt.hash(password, 10),
                date_of_birth: "06-05-1999",
                created_at: new Date(),
                updated_at: new Date(),
            }
        })


        console.log("User seeded successfully");
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.$disconnect();
    }
};

userSeed();