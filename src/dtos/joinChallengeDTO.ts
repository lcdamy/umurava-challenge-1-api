import Joi from 'joi';

class JoinChallengeDTO {
    participant: string;

    constructor(participant: string) {
        this.participant = participant;
    }

    // Add a method to validate the data using Joi
    static validate(data: { participant: string }) {
        const schema = Joi.object({
            participant: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
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
