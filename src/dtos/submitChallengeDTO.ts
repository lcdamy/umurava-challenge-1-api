import Joi from 'joi';

export class SubmitChallengeDTO {
    details_message: string;
    links: { link: string; description: string }[];

    constructor(
        details_message: string,
        links: { link: string; description: string }[]
    ) {
        this.details_message = details_message;
        this.links = links;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        details_message: string;
        links: { link: string; description: string }[];
    }) {
        const schema = Joi.object({
            details_message: Joi.string().allow('').optional(),
            links: Joi.array()
                .items(
                    Joi.object({
                        link: Joi.string().uri().required(),
                        description: Joi.string().allow('').optional(),
                    })
                )
                .required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: SubmitChallengeDTO.formatValidationErrors(error.details),
            };
        }
        return { value };
    }

    // Helper method to format Joi validation errors
    static formatValidationErrors(errorDetails: Joi.ValidationErrorItem[]) {
        return errorDetails.map((error) => ({
            field: error.context?.key,
            type: error.type,
            message: error.message,
        }));
    }
}