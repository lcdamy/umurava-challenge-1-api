"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class UpdateChallengeDTO {
    constructor(id, challengeName, challengeCategory, endDate, starDate, duration, moneyPrize, contactEmail, projectDescription, status, levels, skills, teamSize) {
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
    static validate(data) {
        const schema = joi_1.default.object({
            challengeName: joi_1.default.string().trim(),
            challengeCategory: joi_1.default.string().trim(),
            endDate: joi_1.default.string(),
            startDate: joi_1.default.string(),
            moneyPrize: joi_1.default.array().items(joi_1.default.object({
                categoryPrize: joi_1.default.string(),
                prize: joi_1.default.number().positive(),
                currency: joi_1.default.string().valid('USD', 'EUR', 'GBP', 'RWF', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD').default('RWF')
            })),
            contactEmail: joi_1.default.string().email(),
            projectDescription: joi_1.default.string(),
            levels: joi_1.default.array().items(joi_1.default.string().valid("Junior", "Intermediate", "Senior")),
            skills: joi_1.default.array().items(joi_1.default.string()),
            teamSize: joi_1.default.number().integer().positive(),
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
    static formatValidationErrors(errorDetails) {
        return errorDetails.map((error) => {
            var _a;
            return ({
                field: (_a = error.context) === null || _a === void 0 ? void 0 : _a.key,
                type: error.type,
                message: error.message
            });
        });
    }
}
module.exports = UpdateChallengeDTO;
