import Joi from 'joi';

class ChallengePrizeDTO {
    id: number;
    prizeName: string;
    currency: string;
    description: string;

    constructor(
        id: number,
        prizeName: string,
        currency: string,
        description: string
    ) {
        this.id = id;
        this.prizeName = prizeName;
        this.currency = currency;
        this.description = description;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        prizeName: string;
        currency: string;
        description?: string;
    }) {
        const schema = Joi.object({
            prizeName: Joi.string().required(),
            currency: Joi.string().required(),
            description: Joi.string().optional()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ChallengePrizeDTO.formatValidationErrors(error.details)
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

module.exports = ChallengePrizeDTO;