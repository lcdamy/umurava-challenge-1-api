import Joi from 'joi';

export class CreateUserSocialDTO {
    names: string;
    email: string;
    profile_url: string;

    constructor(
        names: string,
        email: string,
        profile_url: string,
    ) {
        this.names = names;
        this.email = email;
        this.profile_url = profile_url;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        names: string;
        email: string;
        profile_url: string;
    }) {
        const schema = Joi.object({
            names: Joi.string().trim().required(),
            email: Joi.string().email().required(),
            profile_url: Joi.string().uri().required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: CreateUserSocialDTO.formatValidationErrors(error.details)
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