import Joi from 'joi';

class UpdateChallengeStatusDTO {
    status: 'open' | 'ongoing' | 'completed' | 'closed';

    constructor(status: 'open' | 'ongoing' | 'completed' | 'closed') {
        this.status = status;
    }

    // Add a method to validate the status field using Joi
    static validate(data: { status: 'open' | 'ongoing' | 'completed' | 'closed' }) {
        const schema = Joi.object({
            status: Joi.string().valid('open', 'ongoing', 'completed', 'closed').required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: UpdateChallengeStatusDTO.formatValidationErrors(error.details),
            };
        }
        return { value };
    }

    // Helper method to format Joi validation errors
    static formatValidationErrors(errorDetails: Joi.ValidationErrorItem[]) {
        return errorDetails.map((error) => ({
            field: error.context?.key,
            type: error.type,
            message: error.message,
        }));
    }
}

module.exports = UpdateChallengeStatusDTO;
