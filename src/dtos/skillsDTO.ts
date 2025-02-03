import Joi from 'joi';

class SkillsDTO {
    id: number;
    skillName: string;
    status: 'active' | 'inactive';

    constructor(id: number, skillName: string, status: 'active' | 'inactive') {
        this.id = id;
        this.skillName = skillName;
        this.status = status;
    }

    // Add a method to validate the data using Joi
    static validate(data: { skillName: string }) {
        const schema = Joi.object({
            skillName: Joi.string().required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: SkillsDTO.formatValidationErrors(error.details)
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

module.exports = SkillsDTO;