import Joi from 'joi';

class JoinChallengeDTO {
    participants: {
        team_lead: string;
        members: Array<string>;
    };

    constructor(participants: { team_lead: string; members: Array<string> }) {
        this.participants = participants;
    }

    // Add a method to validate the data using Joi
    static validate(data: { participants: { team_lead: string; members: Array<string> } }) {
        const schema = Joi.object({
            participants: Joi.object({
                team_lead: Joi.string().required().messages({
                    'string.empty': 'Team lead is required',
                    'any.required': 'Team lead is required'
                }),
                members: Joi.array()
                    .items(Joi.string())
                    .min(1)
                    .required()
                    .messages({
                        'array.base': 'Members must be an array of strings',
                        'array.min': 'At least one member is required',
                        'any.required': 'Members are required'
                    })
            })
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: JoinChallengeDTO.formatValidationErrors(error.details)
            };
        }
        return { value };
    }

    // Helper method to format Joi validation errors
    static formatValidationErrors(errorDetails: Joi.ValidationErrorItem[]) {
        return errorDetails.map((error) => ({
            field: error.context?.key,
            type: error.type,
            message: error.message
        }));
    }
}

module.exports = JoinChallengeDTO;
