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
    static validate(data: { skillName: string; status: 'active' | 'inactive' }) {
        const schema = Joi.object({
            skillName: Joi.string().required(),
            status: Joi.string().valid('active', 'inactive')
        });

        return schema.validate(data, { abortEarly: false });
    }
}

module.exports = SkillsDTO;