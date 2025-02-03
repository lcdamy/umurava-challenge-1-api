import Joi from 'joi';

class JoinProgramDTO {
    userRole: "participant" | "admin";

    constructor(userRole: "participant" | "admin") {
        this.userRole = userRole;
    }

    // Add a method to validate the data using Joi
    static validate(data: { userRole: "participant" | "admin" }) {
        const schema = Joi.object({
            userRole: Joi.string().valid("participant", "admin").required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: JoinProgramDTO.formatValidationErrors(error.details)
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

module.exports = JoinProgramDTO;
