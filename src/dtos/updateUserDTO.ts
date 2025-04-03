import Joi from 'joi';

export class UpdateUserDTO {
    names: string;
    email: string;

    constructor(
        names: string,
        email: string
    ) {
        this.names = names;
        this.email = email;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        names: string;
        email: string;
    }) {
        const schema = Joi.object({
            names: Joi.string().trim().required(),
            email: Joi.string().email().required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: UpdateUserDTO.formatValidationErrors(error.details)
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