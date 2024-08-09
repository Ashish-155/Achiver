const Joi = require('joi');

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

// login with email
const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

// update profile
const updateProfileValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        contact_no: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('contact_no'),
        isd_code: Joi.string().required().label('isd_code'),
        whats_app_number: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('whats_app_number'),
        location: Joi.string().required().label('location'),
        date_of_birth: Joi.string().required().label('Date of Birth'),
        profile_image: Joi.any()
            .meta({ swaggerType: 'file' })
            .description('File to upload')
            .optional().label('profile_image')
    }),
};

module.exports = {
    loginUserValidation,
    updateProfileValidation,

}