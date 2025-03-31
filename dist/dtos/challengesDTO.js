"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ChallengesDTO {
    constructor(id, challengeName, challengeCategory, endDate, starDate, duration, moneyPrize, contactEmail, projectDescription, status, levels, skills) {
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
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            challengeName: joi_1.default.string().trim().required(),
            challengeCategory: joi_1.default.string().trim().required(),
            endDate: joi_1.default.string().required(),
            startDate: joi_1.default.string().required(),
            moneyPrize: joi_1.default.array()
                .items(joi_1.default.object({
                categoryPrize: joi_1.default.string().required(),
                prize: joi_1.default.number().positive().required()
            }))
                .required(),
            contactEmail: joi_1.default.string().email().required(),
            projectDescription: joi_1.default.string().required(),
            levels: joi_1.default.array().items(joi_1.default.string().valid("Junior", "Intermediate", "Senior")).required(),
            skills: joi_1.default.array().items(joi_1.default.string()).required()
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
module.exports = ChallengesDTO;
