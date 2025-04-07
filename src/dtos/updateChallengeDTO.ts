import Joi from 'joi';

class UpdateChallengeDTO {
    id: string | undefined;
    challengeName: string | undefined;
    challengeCategory: string | undefined;
    endDate: string | undefined;
    startDate: string | undefined;
    duration: number | undefined;
    moneyPrize: Array<{ categoryPrize: string; prize: number, currency: string }> | undefined;
    contactEmail!: string;
    projectDescription: string | undefined;
    status: 'open' | 'ongoing' | 'completed' | undefined;
    levels: Array<string> | undefined;
    skills: Array<string> | undefined;
    teamSize: number | undefined;

    constructor(
        id: string | undefined,
        challengeName: string | undefined,
        challengeCategory: string | undefined,
        endDate: string | undefined,
        starDate: string | undefined,
        duration: number | undefined,
        moneyPrize: Array<{ categoryPrize: string; prize: number, currency: string }> | undefined,
        contactEmail: string,
        projectDescription: string | undefined,
        status: 'open' | 'ongoing' | 'completed' | undefined,
        levels: Array<string> | undefined,
        skills: Array<string> | undefined,
        teamSize: number | undefined
    ) {
        this.id = id;
        this.challengeName = challengeName;
        this.challengeCategory = challengeCategory;
        this.endDate = endDate;
        this.startDate = starDate;
        this.duration = duration;
        this.moneyPrize = moneyPrize;
        this.contactEmail = contactEmail;
        this.projectDescription = projectDescription;
        this.status = status;
        this.levels = levels;
        this.skills = skills;
        this.teamSize = teamSize;
    }

    // Add a method to validate the data using Joi
    static validate(data: {
        id?: string;
        challengeName?: string;
        challengeCategory?: string;
        endDate?: string;
        startDate?: string;
        moneyPrize?: Array<{ categoryPrize: string; prize: number, currency: string }> | undefined;
        contactEmail?: string;
        projectDescription?: string;
        levels?: Array<string>;
        skills?: Array<string>;
        teamSize?: number;
    }) {
        const schema = Joi.object({
            challengeName: Joi.string().trim(),
            challengeCategory: Joi.string().trim(),
            endDate: Joi.string(),
            startDate: Joi.string(),
            moneyPrize: Joi.array().items(
                Joi.object({
                    categoryPrize: Joi.string(),
                    prize: Joi.number().positive(),
                    currency: Joi.string()
                })
            ),
            contactEmail: Joi.string().email(),
            projectDescription: Joi.string(),
            levels: Joi.array().items(Joi.string().valid("Junior", "Intermediate", "Senior")),
            skills: Joi.array().items(Joi.string()),
            teamSize: Joi.number().integer().positive(),
        });

        const { error, value } = schema.validate(data, { abortEarly: false });

        if (error) {
            return {
                errors: UpdateChallengeDTO.formatValidationErrors(error.details)
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

module.exports = UpdateChallengeDTO;
