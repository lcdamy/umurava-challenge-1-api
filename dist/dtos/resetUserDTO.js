"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetUserDTO = void 0;
const joi_1 = __importDefault(require("joi"));
class ResetUserDTO {
    constructor(newPassword, token) {
        this.newPassword = newPassword;
        this.token = token;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            newPassword: joi_1.default.string().min(8).required()
                .messages({
                "string.min": "Password must be at least 8 characters long."
            }),
            token: joi_1.default.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/).required()
                .messages({
                "string.pattern.base": "Token must be a valid JWT."
            }),
        });
        const { error, value } = schema.validate(data, { abortEarly: false });
        if (error) {
            return {
                errors: ResetUserDTO.formatValidationErrors(error.details)
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
exports.ResetUserDTO = ResetUserDTO;
