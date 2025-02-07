import Joi from 'joi';
import { ChallengeCategory } from '../types';

class ChallengesDTO {
    id: string | undefined;
    challengeName: string | undefined;
    endDate: string | undefined;
    startDate: string | undefined;
    duration: number | undefined;
    moneyPrize: string | undefined;
    contactEmail!: string;
    projectDescription: string | undefined;
    projectBrief: string | undefined;
    projectTasks: string | undefined;
    status: 'open' | 'ongoing' | 'completed' | undefined;
    levels: Array<string> | undefined;
    skills: Array<ChallengeCategory> | undefined;

    constructor(
        id: string | undefined,
        challengeName: string | undefined,
        endDate: string | undefined,
        starDate: string | undefined,
        duration: number | undefined,
        moneyPrize: string | undefined,
        contactEmail: string,
        projectDescription: string | undefined,
        projectBrief: string | undefined,
        projectTasks: string | undefined,
        status: 'open' | 'ongoing' | 'completed' | undefined,
        levels: Array<string> | undefined,
        skills: Array<ChallengeCategory> | undefined
    ) {
        this.id = id;
        this.challengeName = challengeName;
        this.endDate = endDate;
        this.startDate = starDate;
        this.duration = duration;
        this.moneyPrize = moneyPrize;
        this.contactEmail = contactEmail;
        this.projectDescription = projectDescription;
        this.projectBrief = projectBrief;
        this.projectTasks = projectTasks;
        this.status = status;
        this.levels = levels;
        this.skills = skills;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        id: string;
        challengeName: string;
        endDate: string;
        startDate: string;
        moneyPrize: string;
        contactEmail: string;
        projectDescription: string;
        projectBrief: string;
        projectTasks: string;
        levels: Array<string>;
        skills: Array<ChallengeCategory>;
    }) {
        const schema = Joi.object({
            challengeName: Joi.string().trim().required(),
            endDate: Joi.string().required(),
            startDate: Joi.string().required(),
            moneyPrize: Joi.string().required(),
            contactEmail: Joi.string().email().required(),
            projectDescription: Joi.string().required(),
            projectBrief: Joi.string().required(),
            projectTasks: Joi.string().required(),
            levels:Joi.array().items(Joi.string().valid("Junior", "Intermediate", "Senior")).required(),
            skills: Joi.array().items(Joi.string().valid(
            'Web Design',
            'UI/UX',
            'Frontend',
            'Backend',
            'Fullstack',
            'Mobile Development',
            'Cybersecurity',
            'Cloud Computing',
            'DevOps',
            'AI/ML',
            'Game Development',
            'Graphic Design',
            'Animation',
            'Product Design',
            'Network Engineering',
            'Systems Engineering'
            )).required()
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: ChallengesDTO.formatValidationErrors(error.details)
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

module.exports = ChallengesDTO;
