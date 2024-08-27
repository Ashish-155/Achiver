const { Authentication } = require("../config/auth");
const controller = require("../controller/goal");
const Joi = require('joi');
const { createGoalValidation, updateGoalValidation, deleteGoalValidation, insertActualGoalDataValidation, insertActualWeekGoalDataValidation, createSeperateGoalValidation, setWeekGoalActionValidation, updateWeekGoalActionValidation, fetchSingleWeekGoalByIdValidation } = require("../validations/goal");

module.exports = [
    // create goal
    {
        method: 'POST',
        path: '/goal/create-goal',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.creatGoal,
            pre: [Authentication],
            description: "Create A Goal",
            validate: {
                ...createGoalValidation,
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
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }

    },

    // seperate goal creation and distribution
    {
        method: 'POST',
        path: '/goal/create-seperate-goal',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.createGoalWithSeperateDistribution,
            pre: [Authentication],
            description: "Create A Goal with Seperate Distribution",
            validate: {
                ...createSeperateGoalValidation,
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
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }

    },


    // get all goals
    {
        method: 'GET',
        path: '/goal/all-goal',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.getAllMyGoals,
            pre: [Authentication],
            description: "Fetch My All Goals",
        }

    },
    // get specific goal
    {
        method: 'GET',
        path: '/goal/{id}',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.fetchSingleGoalById,
            pre: [Authentication],
            description: "Fetch Single Goal By Id",
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required(),
                }),
            },
        }
    },
    // update goal
    {
        method: 'PUT',
        path: '/goal/{id}',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.updateGoal,
            pre: [Authentication],
            description: "Update Goal By Id",
            validate: {
                ...updateGoalValidation,
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
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }
    },
    // delete goal
    {
        method: 'DELETE',
        path: '/goal/delete-goal/{id}',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.deleteGoalById,
            pre: [Authentication],
            description: "Delete Goal By Id",
            validate: {
                ...deleteGoalValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },

        }
    },

    // week_goal action (Create)
    {
        method: 'POST',
        path: '/goal/create-week_goal-action',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.setWeekGoalAction,
            pre: [Authentication],
            description: "Create Week_Goal Action",
            validate: {
                ...setWeekGoalActionValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
        }

    },

    // week_goal action (Update)
    {
        method: 'PUT',
        path: '/goal/update-week_goal-action',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.updateWeekGoalAction,
            pre: [Authentication],
            description: "Update Week_Goal Action",
            validate: {
                ...updateWeekGoalActionValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
        }

    },


    // =================================================================>
    // --------------- (Actual goal data handle here) --------------------
    // =================================================================>

    // insert actual goal data for 12 week
    {
        method: 'PUT',
        path: '/goal/post-actual-goal-data',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.insertActualGoalData,
            pre: [Authentication],
            description: "Insert Actual Data Of A Goal",
            validate: {
                ...insertActualGoalDataValidation,
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
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }

    },

    // insert actual goal data for 1 week
    {
        method: 'PUT',
        path: '/goal/post-actual-week-goal-data',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.insertActualWeekGoalData,
            pre: [Authentication],
            description: "Insert Actual Week Goal Data",
            validate: {
                ...insertActualWeekGoalDataValidation,
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
                output: 'data',
                parse: true,
                allow: 'application/json',
            },
        }

    },

    // fetch single week goal by Id 

    {
        method: 'GET',
        path: '/goal/week-goal-for',
        options: {
            tags: ['api', 'Goal'],
            handler: controller.getSingleWeekById,
            pre: [Authentication],
            description: "Get Single Week Goal By Id",
            validate: {
                ...fetchSingleWeekGoalByIdValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(detail => detail.message);
                    return h.response({
                        statusCode: 400,
                        error: 'Bad Request',
                        message: customErrorMessages
                    }).code(400).takeover();
                }
            },
        }

    },


]