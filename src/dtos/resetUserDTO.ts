import Joi from 'joi';

export class ResetUserDTO {
    newPassword: string;
    token: string;

    constructor(
        newPassword: string,
        token: string,
    ) {
        this.newPassword = newPassword;
        this.token = token;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        newPassword: string;
        token: string;
    }) {
        const schema = Joi.object({
            newPassword: Joi.string().min(8).required()
                .messages({
                    "string.min": "Password must be at least 8 characters long."
                }),
            token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required()
                .messages({
                    "string.pattern.base": "Token must be a valid JWT."
                }),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ResetUserDTO.formatValidationErrors(error.details)
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