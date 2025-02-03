import Joi from 'joi';

class JoinCommunityDTO {
    phoneNumber: string;

    constructor(phoneNumber: string) {
        this.phoneNumber = phoneNumber;
    }

    // Add a method to validate the data using Joi
    static validate(data: { phoneNumber: string }) {
        const schema = Joi.object({
            phoneNumber: Joi.string().regex(/^2507\d{8}$/).required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: JoinCommunityDTO.formatValidationErrors(error.details)
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

module.exports = JoinCommunityDTO;
