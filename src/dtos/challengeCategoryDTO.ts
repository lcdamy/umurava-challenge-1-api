import Joi from 'joi';

class ChallengeCategoryDTO {
    id: number;
    challengeCategoryName: string;
    description: string;

    constructor(id: number, challengeCategoryName: string, description: string) {
        this.id = id;
        this.challengeCategoryName = challengeCategoryName;
        this.description = description;
    }

    // Add a method to validate the data using Joi
    static validate(data: { challengeCategoryName: string }) {
        const schema = Joi.object({
            challengeCategoryName: Joi.string().required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ChallengeCategoryDTO.formatValidationErrors(error.details)
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

module.exports = ChallengeCategoryDTO;