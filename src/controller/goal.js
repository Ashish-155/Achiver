const prisma = require("../config/DbConfig");
const moment = require('moment');


// const creatGoal = async (req, h) => {
//     try {
//         const user = req.rootUser;
//         const { lead_target, lag_target, start_date, description } = req.payload;

//         // Calculate end date as 84 days from today
//         const today = new Date();
//         const endDate = new Date(today);
//         endDate.setDate(today.getDate() + 84);

//         // Convert lead_target and lag_target to numbers for calculations
//         const leadTargetValue = parseFloat(lead_target);
//         const lagTargetValue = parseFloat(lag_target);

//         // Calculate weekly targets
//         const weeklyLeadTarget = (leadTargetValue / 12).toFixed(2);
//         const weeklyLagTarget = (lagTargetValue / 12).toFixed(2);

//         // Create the main goal
//         const newGoal = await prisma.goal.create({
//             data: {
//                 user_id: user.id,
//                 lead_target,
//                 lag_target,
//                 start_date,
//                 description,
//                 duration: "12 weeks",
//                 end_date: endDate.toISOString(),
//             },
//         });

//         // Create week goals
//         const weekGoals = Array.from({ length: 12 }, (_, week) => ({
//             week_for: week + 1,
//             goal_id: newGoal.id,
//             lead_target: weeklyLeadTarget,
//             lag_target: weeklyLagTarget,
//             start_date: new Date(today.setDate(today.getDate() + (week * 7))).toISOString(),
//             end_date: new Date(today.setDate(today.getDate() + (week * 7) + 6)).toISOString(),
//         }));

//         await prisma.week_Goal.createMany({
//             data: weekGoals,
//         });

//         return h.response({
//             message: "Goal and week goals created successfully.",
//             data: newGoal,
//         }).code(201);

//     } catch (error) {
//         console.log(error);
//         return h.response({ message: "Error creating goal", error }).code(500);
//     }
// };

const creatGoal = async (req, h) => {
    try {
        const user = req.rootUser;
        const { lead_target, lag_target, start_date, description } = req.payload;

        // Calculate end date as 84 days from today
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 84);

        // Convert lead_target and lag_target to numbers for calculations
        const leadTargetValue = parseFloat(lead_target);
        const lagTargetValue = parseFloat(lag_target);

        // Calculate weekly targets
        const weeklyLeadTarget = leadTargetValue / 12;
        const weeklyLagTarget = lagTargetValue / 12;

        // Start the transaction
        const result = await prisma.$transaction(async tx => {
            // Create the main goal
            const newGoal = await tx.goal.create({
                data: {
                    user_id: user.id,
                    lead_target,
                    lag_target,
                    start_date,
                    description,
                    duration: "12 weeks",
                    end_date: endDate.toISOString()
                }
            });

            // Create week goals
            const weekGoals = [];
            for (let week = 0; week < 12; week++) {
                const weekStartDate = new Date(today);
                weekStartDate.setDate(today.getDate() + week * 7);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);

                weekGoals.push({
                    week_for: week + 1,
                    goal_id: newGoal.id,
                    lead_target: weeklyLeadTarget,
                    lag_target: weeklyLagTarget,
                    start_date: weekStartDate.toISOString(),
                    end_date: weekEndDate.toISOString()
                });
            }

            await tx.week_Goal.createMany({
                data: weekGoals
            });

            return newGoal;
        });

        return h
            .response({
                message: "Goal and week goals created successfully.",
                data: result
            })
            .code(201);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error creating goal", error }).code(500);
    }
};

// Create goal with separate distribution based on 12-week input
// const createGoalWithSeperateDistribution = async (req, h) => {
//     try {
//         const user = req.rootUser;
//         const { name, weeks, description, start_date } = req.payload;

//         // Sum up the lead and lag targets from all 12 weeks
//         const totalLeadTarget = weeks.reduce((sum, week) => sum + parseFloat(week.lead_target), 0);
//         const totalLagTarget = weeks.reduce((sum, week) => sum + parseFloat(week.lag_target), 0);

//         // Calculate the end date as 12 weeks from the start date
//         const startDate = new Date(start_date);
//         const endDate = new Date(startDate);
//         endDate.setDate(startDate.getDate() + 84); // 84 days = 12 weeks

//         // Start the transaction
//         const result = await prisma.$transaction(async (tx) => {
//             // Create the main goal with the summed lead and lag targets
//             const newGoal = await tx.goal.create({
//                 data: {
//                     user_id: user.id,
//                     name,
//                     lead_target: totalLeadTarget,
//                     lag_target: totalLagTarget,
//                     start_date: startDate.toISOString(),
//                     description,
//                     duration: "12 weeks",
//                     end_date: endDate.toISOString(),
//                 },
//             });

//             // Create the week goals from the provided data
//             const weekGoals = weeks.map((week, index) => {
//                 const weekStartDate = new Date(startDate);
//                 weekStartDate.setDate(startDate.getDate() + (index * 7));
//                 const weekEndDate = new Date(weekStartDate);
//                 weekEndDate.setDate(weekEndDate.getDate() + 6);

//                 return {
//                     week_for: index + 1,
//                     goal_id: newGoal.id,
//                     lead_target: parseFloat(week.lead_target),
//                     lag_target: parseFloat(week.lag_target),
//                     start_date: weekStartDate.toISOString(),
//                     end_date: weekEndDate.toISOString(),
//                 };
//             });

//             await tx.week_Goal.createMany({
//                 data: weekGoals,
//             });

//             return newGoal;
//         });

//         return h.response({
//             message: "Goal and week goals created successfully.",
//             data: result,
//         }).code(201);

//     } catch (error) {
//         console.log(error);
//         return h.response({ message: "Error while creating goal", error }).code(500);
//     }
// };

const createGoalWithSeperateDistribution = async (req, h) => {
    try {
        const user = req.rootUser;
        const { name, weeks, description, start_date } = req.payload;

        // Parse the date from the provided format (DD-MM-YYYY)
        const [day, month, year] = start_date.split("-");
        const startDate = new Date(`${year}-${month}-${day}`);

        // Sum up the lead and lag targets from all 12 weeks
        const totalLeadTarget = weeks.reduce(
            (sum, week) => sum + parseFloat(week.lead_target),
            0
        );
        const totalLagTarget = weeks.reduce(
            (sum, week) => sum + parseFloat(week.lag_target),
            0
        );

        // Calculate the end date as 12 weeks from the start date
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 84); // 84 days = 12 weeks

        // Start the transaction
        const result = await prisma.$transaction(async tx => {
            // Create the main goal with the summed lead and lag targets
            const newGoal = await tx.goal.create({
                data: {
                    user_id: user.id,
                    name,
                    lead_target: totalLeadTarget,
                    lag_target: totalLagTarget,
                    start_date: startDate.toISOString(),
                    description,
                    duration: "12 weeks",
                    end_date: endDate.toISOString()
                }
            });

            // Create the week goals from the provided data
            const weekGoals = weeks.map((week, index) => {
                const weekStartDate = new Date(startDate);
                weekStartDate.setDate(startDate.getDate() + index * 7);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);

                return {
                    week_for: index + 1,
                    goal_id: newGoal.id,
                    lead_target: parseFloat(week.lead_target),
                    lag_target: parseFloat(week.lag_target),
                    start_date: weekStartDate.toISOString(),
                    end_date: weekEndDate.toISOString()
                };
            });

            await tx.week_Goal.createMany({
                data: weekGoals
            });

            return newGoal;
        });

        return h
            .response({
                message: "Goal and week goals created successfully.",
                data: result
            })
            .code(201);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error while creating goal", error })
            .code(500);
    }
};

// get users all goal
const getAllMyGoals = async (req, h) => {
    try {
        const user = req.rootUser;

        const goals = await prisma.goal.findMany({
            where: {
                user_id: user.id,
                deleted_at: null
            }
            // include: {
            //     Week_Goal: true,
            // },
        });
        const currentDate = moment().format('YYYY-MM-DD');

        // Add goal_status to each goal
        const goalsWithStatus = goals.map(goal => {
            let goal_status;

            if (moment(goal.start_date).isAfter(currentDate)) {
                goal_status = 'Upcoming';
            } else if (moment(goal.end_date).isBefore(currentDate)) {
                goal_status = 'Completed';
            } else {
                goal_status = 'Running';
            }

            return {
                ...goal,
                goal_status
            };
        });

        return h
            .response({ message: "Goals fetched successfully.", data: goalsWithStatus })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error while fetching goals", error })
            .code(500);
    }
};

// single goal by Id

// const fetchSingleGoalById = async (req, h) => {
//     try {
//         const user = req.rootUser;
//         const { id } = req.params;

//         const goal = await prisma.goal.findFirst({
//             where: {
//                 id: id,
//                 user_id: user.id,
//                 deleted_at: null
//             },
//             include: {
//                 Week_Goal: true
//             }
//         });

//         if (!goal) {
//             return h.response({ message: "Goal not found." }).code(404);
//         }

//         // Get the current date
//         const currentDate = new Date();
//         let upcomingSet = false;

//         // Add 'running' and 'upcoming' keys to each week goal
//         const updatedWeekGoals = goal.Week_Goal.map(weekGoal => {
//             const startDate = new Date(weekGoal.start_date);
//             const endDate = new Date(weekGoal.end_date);

//             // Check if the current date is within the start and end date of the week goal
//             const isRunning = currentDate >= startDate && currentDate <= endDate;

//             // Check if this is the next upcoming week goal
//             let isUpcoming = false;
//             if (!upcomingSet && startDate > currentDate) {
//                 isUpcoming = true;
//                 upcomingSet = true; // Ensure only the first future week is marked as upcoming
//             }

//             return {
//                 ...weekGoal,
//                 running: isRunning,
//                 upcoming: isUpcoming
//             };
//         });

//         // Update the goal object with the modified Week_Goal array
//         goal.Week_Goal = updatedWeekGoals;

//         return h
//             .response({
//                 success: true,
//                 message: "Goal fetched successfully.",
//                 data: goal
//             })
//             .code(200);
//     } catch (error) {
//         console.log(error);
//         return h
//             .response({
//                 message: "Error while fetching goal",
//                 error
//             })
//             .code(500);
//     }
// };

const fetchSingleGoalById = async (req, h) => {
    try {
        const user = req.rootUser;
        const { id } = req.params;

        const goal = await prisma.goal.findFirst({
            where: {
                id: id,
                user_id: user.id,
                deleted_at: null
            },
            include: {
                Week_Goal: true
            }
        });

        if (!goal) {
            return h.response({ message: "Goal not found." }).code(404);
        }

        // Get the current date without the time part
        const currentDate = new Date();
        const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

        let upcomingSet = false;

        // Add 'running' and 'upcoming' keys to each week goal
        const updatedWeekGoals = goal.Week_Goal.map(weekGoal => {
            // Convert start_date and end_date to Date objects
            const startDate = new Date(weekGoal.start_date);
            const endDate = new Date(weekGoal.end_date);

            const startDateWithoutTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateWithoutTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

            // Check if the current date is within the start and end date of the week goal
            const isRunning = currentDateWithoutTime >= startDateWithoutTime && currentDateWithoutTime <= endDateWithoutTime;

            // Check if this is the next upcoming week goal
            let isUpcoming = false;
            if (!upcomingSet && startDateWithoutTime > currentDateWithoutTime) {
                isUpcoming = true;
                upcomingSet = true; // Ensure only the first future week is marked as upcoming
            }

            return {
                ...weekGoal,
                running: isRunning,
                upcoming: isUpcoming
            };
        });

        // Update the goal object with the modified Week_Goal array
        goal.Week_Goal = updatedWeekGoals;

        return h
            .response({
                success: true,
                message: "Goal fetched successfully.",
                data: goal
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({
                message: "Error while fetching goal",
                error
            })
            .code(500);
    }
};

// update a goal by id
const updateGoal = async (req, h) => {
    try {
        const user = req.rootUser;
        const {
            goal_id,
            lead_target,
            lag_target,
            start_date,
            description
        } = req.payload;

        // Validate if the goal exists and belongs to the user
        const existingGoal = await prisma.goal.findUnique({
            where: {
                id: goal_id,
                user_id: user.id,
                deleted_at: null
            }
        });

        if (!existingGoal) {
            return h.response({ message: "Goal not found" }).code(404);
        }

        if (existingGoal.user_id !== user.id) {
            return h.response({ message: "Unauthorized" }).code(403);
        }

        // Calculate end date as 84 days from the new start date
        const newStartDate = new Date(start_date);
        const endDate = new Date(newStartDate);
        endDate.setDate(newStartDate.getDate() + 84);

        // Convert lead_target and lag_target to numbers for calculations
        const leadTargetValue = parseFloat(lead_target);
        const lagTargetValue = parseFloat(lag_target);

        // Calculate weekly targets
        const weeklyLeadTarget = (leadTargetValue / 12).toFixed(2);
        const weeklyLagTarget = (lagTargetValue / 12).toFixed(2);

        // Start the transaction
        const result = await prisma.$transaction(async tx => {
            // Update the main goal
            const updatedGoal = await tx.goal.update({
                where: { id: goal_id },
                data: {
                    lead_target,
                    lag_target,
                    start_date,
                    description,
                    duration: "12 weeks",
                    end_date: endDate.toISOString()
                }
            });

            // Recreate week goals
            const weekGoals = [];
            for (let week = 0; week < 12; week++) {
                const weekStartDate = new Date(newStartDate);
                weekStartDate.setDate(newStartDate.getDate() + week * 7);
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekEndDate.getDate() + 6);

                weekGoals.push({
                    week_for: week + 1,
                    goal_id: updatedGoal.id,
                    lead_target: weeklyLeadTarget,
                    lag_target: weeklyLagTarget,
                    start_date: weekStartDate.toISOString(),
                    end_date: weekEndDate.toISOString()
                });
            }

            // Delete existing week goals and create new ones
            await tx.week_Goal.deleteMany({
                where: { goal_id: updatedGoal.id }
            });

            await tx.week_Goal.createMany({
                data: weekGoals
            });

            return updatedGoal;
        });

        return h
            .response({
                message: "Goal and week goals updated successfully.",
                data: result
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h.response({ message: "Error updating goal", error }).code(500);
    }
};

// delete a goal by id
const deleteGoalById = async (req, h) => {
    try {
        const user = req.rootUser;
        const { goal_id } = req.payload;

        const existingGoal = await prisma.goal.findUnique({
            where: { id: goal_id }
        });

        if (!existingGoal) {
            return h.response({ message: "Goal not found" }).code(404);
        }

        if (existingGoal.user_id !== user.id) {
            return h.response({ message: "Unauthorized" }).code(403);
        }

        const updatedGoal = await prisma.goal.update({
            where: { id: goal_id },
            data: {
                deleted_at: new Date()
            }
        });

        return h
            .response({
                message: "Goal deleted successfully.",
                data: updatedGoal
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({
                message:
                    "Error deleti                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ng goal",
                error
            })
            .code(500);
    }
};

// week_goal action (Create)
const setWeekGoalAction = async (req, h) => {
    try {
        const user = req.rootUser;
        const { week_goal_id, key_action, who, day } = req.payload;

        const existingGoal = await prisma.week_Goal.findUnique({
            where: {
                id: week_goal_id,
                deleted_at: null
            }
        });
        if (!existingGoal) {
            return h.response({ message: "Week_goal not found" }).code(404);
        }

        const actionData = await prisma.week_Goal_Actions.create({
            data: {
                week_goal_id: existingGoal.id,
                key_action,
                who,
                day
            }
        });

        return h
            .response({
                message: "Week goal's action set successfully.",
                data: actionData
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error while setting week goal's action", error })
            .code(500);
    }
};

// week_goal action (Update)
const updateWeekGoalAction = async (req, h) => {
    try {
        const user = req.rootUser;
        const { week_goal_action_id, key_action, who, day } = req.payload;

        const existingGoal = await prisma.week_Goal_Actions.findUnique({
            where: {
                id: week_goal_action_id,
                deleted_at: null
            }
        });
        if (!existingGoal) {
            return h.response({ message: "Week_goal_action not found" }).code(404);
        }
        const actionData = await prisma.week_Goal_Actions.update({
            where: {
                id: existingGoal.id,
                deleted_at: null
            },
            data: {
                key_action,
                who,
                day
            }
        });

        return h
            .response({
                message: "Week goal's action updated successfully.",
                data: actionData
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error updating goal action", error })
            .code(500);
    }
};

// week_goal action (Delete)
const removeWeekGoalAction = async (req, h) => {
    try {
        const { week_goal_action_id } = req.payload;

        const weekGoalAction = await prisma.week_Goal_Actions.findUnique({
            where: {
                id: week_goal_action_id,
                deleted_at: null
            }
        });
        if (!weekGoalAction) {
            return h.response({ message: "Week goal action not found" }).code(404);
        }
        const removeWeekGoalAction = await prisma.week_Goal_Actions.update({
            where: {
                id: weekGoalAction.id,
                deleted_at: null
            },
            data: {
                deleted_at: new Date()
            }
        });
        return h
            .response({
                message: "Week goal's action deleted successfully.",
                data: removeWeekGoalAction
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error while deleting goal action" })
            .code(500);
    }
};

// fetch single week by Id
const getSingleWeekById = async (req, h) => {
    try {
        // const user = req.rootUser;
        const { id } = req.query;

        const weekGoal = await prisma.week_Goal.findFirst({
            where: {
                id: id,
                deleted_at: null
            },
            include: {
                Week_Goal_Actions: {
                    where: {
                        deleted_at: null,
                    }
                }
            }
        });
        return h
            .response({
                success: true,
                message: "Single week goal fetched successfully",
                data: weekGoal
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error fetching single week", error })
            .code(500);
    }
};

// cummulative calculation api 
const cummulativeCalculationApi = async (req, h) => {
    try {
        const user = req.rootUser;
        const { goal_id, week_goal_id } = req.query;

        const weekGoal = await prisma.week_Goal.findFirst({
            where: {
                id: week_goal_id,
                goal_id: goal_id,
                deleted_at: null
            }
        });
        // console.log("weekGoal : ", weekGoal);
        if (!weekGoal) {
            return h.response({ success: false, message: "Week goal not found" }).code(404);
        }

        const weekGoals = await prisma.week_Goal.findMany({
            where: {
                goal_id: goal_id,
                week_for: {
                    lte: weekGoal.week_for
                },
                deleted_at: null
            }
        });

        // console.log("AllWeekGoals : ", weekGoals.map((val) => {
        //     return {
        //         id: val.id,
        //         week_for: val.week_for,
        //         lead_target: val.lead_target,
        //         lag_actual: val.lag_actual
        //     }
        // }));

        // Calculate the cumulative sum of lead_target and lag_actual
        const cumulativeLeadTarget = weekGoals.reduce((sum, wg) => sum + (wg.lead_target || 0), 0);
        const cumulativeLagActual = weekGoals.reduce((sum, wg) => sum + (wg.lead_actual || 0), 0);

        // console.log("Lead : ", cumulativeLeadTarget)
        // console.log("Actual : ", cumulativeLagActual)

        return h.response({
            success: true,
            message: "Cumulative calculation fetched successfully.",
            data: {
                cumulativeLeadTarget,
                cumulativeLagActual
            }
        }).code(200);
    } catch (error) {
        console.log(error);
    }
}

// =================================================================>
// --------------- (Actual goal data handle here) -------------------
// =================================================================>

// feed actual 12 week data
// const insertActualGoalData = async (req, h) => {
//     try {
//         const user = req.rootUser;
//         const { goal_id, lead_actual, lag_actual, description } = req.payload;
//         const existingGoal = await prisma.goal.findUnique({
//             where: {
//                 id: goal_id,
//                 user_id: user.id,
//                 deleted_at: null,
//             },
//         });

//         if (!existingGoal) {
//             return h.response({ message: "Goal not found" }).code(404);
//         }

//         let leadExecutionScore = null;
//         if (lead_actual !== undefined && existingGoal.lead_target) {
//             if (lead_actual === existingGoal.lead_target) {
//                 leadExecutionScore = '100%';
//             } else {
//                 leadExecutionScore = (((lead_actual - existingGoal.lead_target) / existingGoal.lead_target) * 100).toFixed(2) + '%';
//             }
//         }

//         let lagExecutionScore = null;
//         if (lag_actual !== undefined && existingGoal.lag_target) {
//             if (lag_actual === existingGoal.lag_target) {
//                 lagExecutionScore = '100%';
//             } else {
//                 lagExecutionScore = (((lag_actual - existingGoal.lag_target) / existingGoal.lag_target) * 100).toFixed(2) + '%';
//             }
//         }

//         const insertedActualData = await prisma.goal.update({
//             where: {
//                 id: existingGoal.id,
//                 deleted_at: null,
//             },
//             data: {
//                 lead_actual,
//                 lag_actual,
//                 description,
//                 lead_execution_score: leadExecutionScore,
//                 lag_execution_score: lagExecutionScore,
//             },
//         })
//         return h.response({ message: "Actual goal data inserted successfully.", data: insertedActualData }).code(200);
//     } catch (error) {
//         console.log(error);
//         return h.response({ message: "Error inserting actual goal data", error }).code(500);
//     }
// }

// this is valid for post and update too.
const insertActualGoalData = async (req, h) => {
    try {
        const user = req.rootUser;
        const { goal_id, lead_actual, lag_actual, description } = req.payload;

        const existingGoal = await prisma.goal.findUnique({
            where: {
                id: goal_id,
                user_id: user.id,
                deleted_at: null
            }
        });

        if (!existingGoal) {
            return h.response({ message: "Goal not found" }).code(404);
        }

        let leadExecutionScore = null;
        if (lead_actual !== undefined && existingGoal.lead_target) {
            const leadChange =
                (lead_actual - existingGoal.lead_target) /
                existingGoal.lead_target *
                100;
            leadExecutionScore =
                (leadChange >= 0 ? "+" : "") + leadChange.toFixed(2) + "%";
        }

        let lagExecutionScore = null;
        if (lag_actual !== undefined && existingGoal.lag_target) {
            const lagChange =
                (lag_actual - existingGoal.lag_target) / existingGoal.lag_target * 100;
            lagExecutionScore =
                (lagChange >= 0 ? "+" : "") + lagChange.toFixed(2) + "%";
        }

        const insertedActualData = await prisma.goal.update({
            where: {
                id: existingGoal.id,
                deleted_at: null
            },
            data: {
                lead_actual,
                lag_actual,
                description,
                lead_execution_score: leadExecutionScore,
                lag_execution_score: lagExecutionScore
            }
        });

        return h
            .response({
                message: "Actual goal data inserted successfully.",
                data: insertedActualData
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error inserting actual goal data", error })
            .code(500);
    }
};

// feed actual per week data
const insertActualWeekGoalData = async (req, h) => {
    try {
        const user = req.rootUser;
        const { week_goal_id, lead_actual, lag_actual, description } = req.payload;

        const existingWeekGoal = await prisma.week_Goal.findUnique({
            where: {
                id: week_goal_id,
                goal: {
                    user_id: user.id,
                    deleted_at: null
                },
                deleted_at: null
            },
            include: {
                goal: true
            }
        });

        if (!existingWeekGoal) {
            return h.response({ message: "Week goal not found" }).code(404);
        }

        let leadExecutionScore = null;
        if (lead_actual !== undefined && existingWeekGoal.lead_target) {
            const leadChange =
                (lead_actual - existingWeekGoal.lead_target) /
                existingWeekGoal.lead_target *
                100;
            leadExecutionScore =
                (leadChange >= 0 ? "+" : "") + leadChange.toFixed(2) + "%";
        }

        let lagExecutionScore = null;
        if (lag_actual !== undefined && existingWeekGoal.lag_target) {
            const lagChange =
                (lag_actual - existingWeekGoal.lag_target) /
                existingWeekGoal.lag_target *
                100;
            lagExecutionScore =
                (lagChange >= 0 ? "+" : "") + lagChange.toFixed(2) + "%";
        }

        // console.log("lead_actual :", lead_actual);
        // console.log("lead_target :", existingWeekGoal.lead_target)

        // console.log("Lead : ", leadExecutionScore);
        // console.log("Lag : ", lagExecutionScore)

        const insertedActualWeekGoalData = await prisma.week_Goal.update({
            where: {
                id: existingWeekGoal.id,
                deleted_at: null
            },
            data: {
                lead_actual,
                lag_actual,
                description,
                lead_execution_score: leadExecutionScore,
                lag_execution_score: lagExecutionScore
            }
        });

        /////////////////////////////////////////////////////////////////
        // Main goal calculation
        const existingGoal = await prisma.goal.findUnique({
            where: {
                id: existingWeekGoal.goal_id,
                user_id: user.id,
                deleted_at: null
            },
            include: {
                Week_Goal: true
            }
        });

        if (!existingGoal) {
            return h.response({ message: "Goal not found" }).code(404);
        }

        // Sum of all lead_actual from the week goals
        const final_actual_lead = existingGoal.Week_Goal.reduce(
            (total, weekGoal) => {
                return total + (weekGoal.lead_actual || 0); // If lead_actual is null, treat it as 0
            },
            0
        );

        // Sum of all lag_actual from the week goals
        const final_actual_lag = existingGoal.Week_Goal.reduce(
            (total, weekGoal) => {
                return total + (weekGoal.lag_actual || 0); // If lag_actual is null, treat it as 0
            },
            0
        );

        let leadScoreForGoal = null;
        if (final_actual_lead !== undefined) {
            const leadScoreChange =
                (final_actual_lead - existingGoal.lead_target) /
                existingGoal.lead_target *
                100;
            leadScoreForGoal =
                (leadScoreChange >= 0 ? "+" : "") + leadScoreChange.toFixed(2) + "%";
        }

        let lagScoreForGoal = null;
        if (final_actual_lag !== undefined) {
            const lagScoreChange =
                (final_actual_lag - existingGoal.lag_target) /
                existingGoal.lag_target *
                100;
            lagScoreForGoal =
                (lagScoreChange >= 0 ? "+" : "") + lagScoreChange.toFixed(2) + "%";
        }

        const insertedActualData = await prisma.goal.update({
            where: {
                id: existingGoal.id,
                deleted_at: null
            },
            data: {
                lead_actual: final_actual_lead,
                lag_actual: final_actual_lag,
                lead_execution_score: leadScoreForGoal,
                lag_execution_score: lagScoreForGoal
            }
        });

        ///////////////////////////////////////////////////////////////////
        return h
            .response({
                message: "Actual week goal data inserted successfully.",
                data: insertedActualWeekGoalData
            })
            .code(200);
    } catch (error) {
        console.log(error);
        return h
            .response({ message: "Error inserting actual week goal data", error })
            .code(500);
    }
};

// const insertActualWeekGoalData = async (req, h) => {
//     try {
//         const user = req.rootUser;
//         const { week_goal_id, lead_actual, lag_actual, description } = req.payload;

//         const existingWeekGoal = await prisma.week_Goal.findUnique({
//             where: {
//                 id: week_goal_id,
//                 goal: {
//                     user_id: user.id,
//                     deleted_at: null
//                 },
//                 deleted_at: null
//             },
//             include: {
//                 goal: true
//             }
//         });

//         if (!existingWeekGoal) {
//             return h.response({ message: "Week goal not found" }).code(404);
//         }

//         // Calculate lead and lag execution scores for the current week
//         let leadExecutionScore = null;
//         if (lead_actual !== undefined && existingWeekGoal.lead_target) {
//             const leadChange =
//                 (lead_actual - existingWeekGoal.lead_target) /
//                 existingWeekGoal.lead_target *
//                 100;
//             leadExecutionScore =
//                 (leadChange >= 0 ? "+" : "") + leadChange.toFixed(2) + "%";
//         }

//         let lagExecutionScore = null;
//         if (lag_actual !== undefined && existingWeekGoal.lag_target) {
//             const lagChange =
//                 (lag_actual - existingWeekGoal.lag_target) /
//                 existingWeekGoal.lag_target *
//                 100;
//             lagExecutionScore =
//                 (lagChange >= 0 ? "+" : "") + lagChange.toFixed(2) + "%";
//         }

//         // Update the current week goal with actual data and calculated scores
//         const insertedActualWeekGoalData = await prisma.week_Goal.update({
//             where: {
//                 id: existingWeekGoal.id,
//                 deleted_at: null
//             },
//             data: {
//                 lead_actual,
//                 lag_actual,
//                 description,
//                 lead_execution_score: leadExecutionScore,
//                 lag_execution_score: lagExecutionScore
//             }
//         });

//         // Fetch all week goals up to the current week to calculate cumulative sums
//         const allWeekGoals = await prisma.week_Goal.findMany({
//             where: {
//                 goal_id: existingWeekGoal.goal_id,
//                 deleted_at: null,
//                 start_date: {
//                     lte: existingWeekGoal.start_date // Ensure we fetch up to the current week
//                 }
//             }
//         });

//         // Calculate cumulative sums for lead and lag actuals
//         const leadCumulativeSum = allWeekGoals.reduce((sum, weekGoal) => {
//             return sum + (weekGoal.lead_actual || 0); // Treat null as 0
//         }, 0);

//         const lagCumulativeSum = allWeekGoals.reduce((sum, weekGoal) => {
//             return sum + (weekGoal.lag_actual || 0); // Treat null as 0
//         }, 0);

//         // Update the current week goal with the cumulative sums
//         await prisma.week_Goal.update({
//             where: {
//                 id: existingWeekGoal.id,
//                 deleted_at: null
//             },
//             data: {
//                 lead_cumulative_execution_score: leadCumulativeSum.toString(),
//                 lag_cumulative_execution_score: lagCumulativeSum.toString()
//             }
//         });

//         return h
//             .response({
//                 message: "Actual week goal data inserted successfully.",
//                 data: insertedActualWeekGoalData
//             })
//             .code(200);
//     } catch (error) {
//         console.log(error);
//         return h
//             .response({ message: "Error inserting actual week goal data", error })
//             .code(500);
//     }
// };



// counter api 
const counterApi = async (req, h) => {
    try {
        const user = req.rootUser;
        const currentDate = moment().format('YYYY-MM-DD');

        const [completed, upcoming, running] = await Promise.all([
            // Completed goals (where end date has passed)
            prisma.goal.count({
                where: {
                    user_id: user.id,
                    end_date: {
                        lt: currentDate
                    },
                    deleted_at: null
                }
            }),
            // Upcoming goals (where start date is in the future)
            prisma.goal.count({
                where: {
                    user_id: user.id,
                    start_date: {
                        gt: currentDate
                    },
                    deleted_at: null
                }
            }),
            // Running goals (where current date falls between start and end dates)
            prisma.goal.count({
                where: {
                    user_id: user.id,
                    start_date: {
                        lte: currentDate
                    },
                    end_date: {
                        gte: currentDate
                    },
                    deleted_at: null
                }
            })
        ]);

        return h.response({
            message: "All counted data fetched successfully",
            meta: {
                completed_goals: completed,
                upcoming_goals: upcoming,
                running_goals: running
            }
        }).code(200);

    } catch (error) {
        console.log(error);
        return h.response({ message: "Error while counting goals", error }).code(500);
    }
};


module.exports = {
    creatGoal,
    createGoalWithSeperateDistribution,
    getAllMyGoals,
    fetchSingleGoalById,
    updateGoal,
    deleteGoalById,
    setWeekGoalAction,
    updateWeekGoalAction,

    insertActualGoalData,
    insertActualWeekGoalData,
    getSingleWeekById,
    removeWeekGoalAction,
    counterApi,
    cummulativeCalculationApi,
};
