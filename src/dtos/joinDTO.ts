import Joi from 'joi';

class JoinDTO {
    userRole: 'admin' | 'participant';

    constructor(userRole: 'admin' | 'participant') {
        this.userRole = userRole;
    }

    // Add a method to validate the data using Joi
    static validate(data: { userRole: 'admin' | 'participant' }) {
        const schema = Joi.object({
            userRole: Joi.string().required().valid('admin', 'participant')
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: JoinDTO.formatValidationErrors(error.details)
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

module.exports = JoinDTO;
