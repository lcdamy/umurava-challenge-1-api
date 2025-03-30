import Joi from 'joi';

export class ResetUserDTO {
    email: string;
    newPassword: string;
    token: string;

    constructor(
        email: string,
        newPassword: string,
        token: string,
    ) {
        this.email = email;
        this.newPassword = newPassword;
        this.token = token;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        email: string;
        newPassword: string;
        token: string;
    }) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
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