"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class JoinChallengeDTO {
    constructor(participants) {
        this.participants = participants;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            participants: joi_1.default.object({
                members: joi_1.default.array()
                    .items(joi_1.default.string().email().messages({
                    'string.email': 'Each member must be a valid email'
                }))
                    .min(0) // Allow an empty array
                    .messages({
                    'array.base': 'Members must be an array of valid emails'
                })
            })
        });
        const { error, value } = schema.validate(data, { abortEarly: false });
        if (error) {
            return {
                errors: error.details ? JoinChallengeDTO.formatValidationErrors(error.details) : []
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
module.exports = JoinChallengeDTO;
