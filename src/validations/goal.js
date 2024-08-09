const Joi = require('joi');
const { DAYS_IN_A_WEEK } = require('../utills/constants');
const datePattern = /^\d{2}-\d{2}-\d{4}$/;

const createGoalValidation = {
    payload: Joi.object({
        lead_target: Joi.number().required().label('lead_target'),
        lag_target: Joi.number().required().label('lag_target'),
        // start_date: Joi.string().required().label('start_date'),
        start_date: Joi.string()
            .pattern(datePattern, 'dd-mm-yyyy')
            .required()
            .label('start_date')
            .messages({
                'string.pattern.name': 'start_date must be in dd-mm-yyyy format',
            }),
        description: Joi.string().optional().label('description'),
    }),
}

// seperate week goal creation 
const createSeperateGoalValidation = {
    payload: Joi.object({
        description: Joi.string().optional().label('description'),

        start_date: Joi.string()
            .pattern(datePattern, 'dd-mm-yyyy')
            .required()
            .label('start_date')
            .messages({
                'string.pattern.name': 'start_date must be in dd-mm-yyyy format',
            }),

        // Array of week targets with lead and lag targets for each week
        weeks: Joi.array().items(
            Joi.object({
                lead_target: Joi.number().required().label('lead_target'),
                lag_target: Joi.number().required().label('lag_target'),
            })
        )
            .length(12) // Ensure exactly 12 weeks are provided
            .required()
            .label('weeks')
            .messages({
                'array.length': 'You must provide exactly 12 weeks of targets',
            }),
    }),
};

// update goal
const updateGoalValidation = {
    payload: Joi.object({
        goal_id: Joi.number().integer().positive().required().label('goal_id'),
        lead_target: Joi.number().required().label('lead_target'),
        lag_target: Joi.number().required().label('lag_target'),
        start_date: Joi.string()
            .pattern(datePattern, 'dd-mm-yyyy')
            .required()
            .label('start_date')
            .messages({
                'string.pattern.name': 'start_date must be in dd-mm-yyyy format',
            }),
        description: Joi.string().optional().label('description'),
    }),
};

// delete goal 
const deleteGoalValidation = {
    payload: Joi.object({
        goal_id: Joi.number().integer().positive().required().label('goal_id'),
    }),
};

// week_goal action (Create)
const setWeekGoalActionValidation = {
    payload: Joi.object({
        week_goal_id: Joi.number().integer().positive().required().label('week_goal_id'),
        key_action: Joi.string().optional().label('key_action'),
        who: Joi.string().optional().label('who'),
        day: Joi.string().optional().
            valid(DAYS_IN_A_WEEK.MONDAY, DAYS_IN_A_WEEK.TUESDAY, DAYS_IN_A_WEEK.WEDNESDAY, DAYS_IN_A_WEEK.THURSDAY, DAYS_IN_A_WEEK.FRIDAY, DAYS_IN_A_WEEK.SATURDAY, DAYS_IN_A_WEEK.SUNDAY)
            .label('day'),
    }),
}

// week_goal action (Update)
const updateWeekGoalActionValidation = {
    payload: Joi.object({
        week_goal_action_id: Joi.number().integer().positive().required().label('week_goal_action_id'),
        key_action: Joi.string().optional().label('key_action'),
        who: Joi.string().optional().label('who'),
        day: Joi.string().optional().
            valid(DAYS_IN_A_WEEK.MONDAY, DAYS_IN_A_WEEK.TUESDAY, DAYS_IN_A_WEEK.WEDNESDAY, DAYS_IN_A_WEEK.THURSDAY, DAYS_IN_A_WEEK.FRIDAY, DAYS_IN_A_WEEK.SATURDAY, DAYS_IN_A_WEEK.SUNDAY)
            .label('day'),
    }),
}

// =================================================================>
// --------------- (Actual goal data handle here) --------------------
// =================================================================>

// insert actual goal data
const insertActualGoalDataValidation = {
    payload: Joi.object({
        goal_id: Joi.number().integer().positive().required().label('goal_id'),
        lead_actual: Joi.number().required().label('lead_actual'),
        lag_actual: Joi.number().required().label('lag_actual'),
        description: Joi.string().optional().label('description'),
    }),
}

// insert actual goal data
const insertActualWeekGoalDataValidation = {
    payload: Joi.object({
        week_goal_id: Joi.number().integer().positive().required().label('week_goal_id'),
        lead_actual: Joi.number().required().label('lead_actual'),
        lag_actual: Joi.number().required().label('lag_actual'),
        description: Joi.string().optional().label('description'),
    }),
}

module.exports = {
    createGoalValidation,

    createSeperateGoalValidation,
    setWeekGoalActionValidation,
    updateWeekGoalActionValidation,

    updateGoalValidation,
    deleteGoalValidation,
    insertActualGoalDataValidation,
    insertActualWeekGoalDataValidation,

}