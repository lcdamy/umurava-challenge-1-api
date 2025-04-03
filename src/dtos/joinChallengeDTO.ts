import Joi from 'joi';

class JoinChallengeDTO {
    participants: {
        members: Array<string>;
    };

    constructor(participants: { members: Array<string> }) {
        this.participants = participants;
    }

    // Add a method to validate the data using Joi
    static validate(data: { participants: { members: Array<string> } }) {
        const schema = Joi.object({
            participants: Joi.object({
                members: Joi.array()
                    .items(Joi.string().email().messages({
                        'string.email': 'Each member must be a valid email'
                    }))
                    .min(0) // Allow an empty array
                    .messages({
                        'array.base': 'Members must be an array of valid emails'
                    })
            })
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: error.details ? JoinChallengeDTO.formatValidationErrors(error.details) : []
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
