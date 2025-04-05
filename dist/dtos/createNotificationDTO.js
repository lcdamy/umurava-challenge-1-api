"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateNotificationDTO = void 0;
const joi_1 = __importDefault(require("joi"));
class CreateNotificationDTO {
    constructor(timestamp, type, message, userId, status) {
        this.timestamp = timestamp;
        this.type = type;
        this.message = message;
        this.userId = userId;
        this.status = status;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            timestamp: joi_1.default.date().required(),
            type: joi_1.default.string().valid('info', 'warning', 'error').required(),
            message: joi_1.default.string().trim().required(),
            userId: joi_1.default.string().trim().required(),
            status: joi_1.default.string().valid('read', 'unread').required(),
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
exports.CreateNotificationDTO = CreateNotificationDTO;
