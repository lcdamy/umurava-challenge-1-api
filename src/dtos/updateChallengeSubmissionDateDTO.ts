import Joi from 'joi';

class UpdateChallengeSubmissionDateDTO {
    new_submissionDate: string | undefined;

    constructor(new_submissionDate: string | undefined) {
        this.new_submissionDate = new_submissionDate;
    }

    // Add a method to validate the new_submissionDate using Joi
    static validate(data: { new_submissionDate?: string }) {
        const schema = Joi.object({
            new_submissionDate: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required()
            .messages({
                'string.pattern.base': 'new_submissionDate must be in the format YYYY-MM-DD',
                'any.required': 'new_submissionDate is required'
            })
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: UpdateChallengeSubmissionDateDTO.formatValidationErrors(error.details)
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

module.exports = UpdateChallengeSubmissionDateDTO;
