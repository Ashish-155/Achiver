const { Authentication } = require("../config/auth");
const controller = require("../controller/user")
const Joi = require('joi');
const { loginUserValidation, updateProfileValidation } = require("../validations/user");
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

module.exports = [

    //login route 
    {
        method: 'POST',
        path: '/user/login',
        options: {
            tags: ['api', 'User'],
            handler: controller.userLogin,
            description: "User Login",
            validate: loginUserValidation,
            payload: {
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }

    },

    // user-profile
    {
        method: 'GET',
        path: '/user/my-profile',
        options: {
            tags: ['api', 'User'],
            handler: controller.userProfile,
            pre: [Authentication],
            description: "Get user profile",
        }
    },

    // profile update
    {
        method: 'PUT',
        path: '/user/update-profile',
        options: {
            tags: ['api', 'User'],
            handler: controller.editUserProfile,
            description: "Update User Profile",
            pre: [Authentication],
            validate: {
                ...updateProfileValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10MB limit
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: []
                }
            }
        }

    },


]