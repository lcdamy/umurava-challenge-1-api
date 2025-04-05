"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitChallengeDTO = void 0;
const joi_1 = __importDefault(require("joi"));
class SubmitChallengeDTO {
    constructor(details_message, links) {
        this.details_message = details_message;
        this.links = links;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            details_message: joi_1.default.string().allow('').optional(),
            links: joi_1.default.array()
                .items(joi_1.default.object({
                link: joi_1.default.string().uri().required(),
                description: joi_1.default.string().allow('').optional(),
            }))
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
    static formatValidationErrors(errorDetails) {
        return errorDetails.map((error) => {
            var _a;
            return ({
                field: (_a = error.context) === null || _a === void 0 ? void 0 : _a.key,
                type: error.type,
                message: error.message,
            });
        });
    }
}
exports.SubmitChallengeDTO = SubmitChallengeDTO;
