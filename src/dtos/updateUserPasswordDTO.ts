import Joi from 'joi';

export class UpdateUserPasswordDTO {
    currentPassword: string;
    newPassword: string;

    constructor(
        currentPassword: string,
        newPassword: string
    ) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        currentPassword: string;
        newPassword: string;
    }) {
        const schema = Joi.object({
            currentPassword: Joi.string().min(6).required(),
            newPassword: Joi.string().min(6).required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: UpdateUserPasswordDTO.formatValidationErrors(error.details)
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