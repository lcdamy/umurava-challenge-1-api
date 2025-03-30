import Joi from 'joi';

export class ForgetUserDTO {
    email: string;

    constructor(
        email: string
    ) {
        this.email = email;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        email: string;
    }) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ForgetUserDTO.formatValidationErrors(error.details)
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