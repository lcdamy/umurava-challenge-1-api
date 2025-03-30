import Joi from 'joi';

export class CreateUserDTO {
    names: string;
    email: string;
    password: string;

    constructor(
        names: string,
        email: string,
        password: string,
    ) {
        this.names = names;
        this.email = email;
        this.password = password;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        names: string;
        email: string;
        password: string;
    }) {
        const schema = Joi.object({
            names: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: CreateUserDTO.formatValidationErrors(error.details)
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