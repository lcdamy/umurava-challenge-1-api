import Joi from 'joi';

export class CreateNotificationDTO {
    timestamp: Date;
    type: string;
    message: string;
    userId: string;
    status: string;

    constructor(
        timestamp: Date,
        type: string,
        message: string,
        userId: string,
        status: string
    ) {
        this.timestamp = timestamp;
        this.type = type;
        this.message = message;
        this.userId = userId;
        this.status = status;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        timestamp: Date;
        type: string;
        message: string;
        userId: string;
        status: string;
    }) {
        const schema = Joi.object({
            timestamp: Joi.date().required(),
            type: Joi.string().valid('info', 'warning', 'error').required(),
            message: Joi.string().trim().required(),
            userId: Joi.string().trim().required(),
            status: Joi.string().valid('read', 'unread').required(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: CreateNotificationDTO.formatValidationErrors(error.details)
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