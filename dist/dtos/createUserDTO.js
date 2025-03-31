"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserDTO = void 0;
const joi_1 = __importDefault(require("joi"));
class CreateUserDTO {
    constructor(names, email, password) {
        this.names = names;
        this.email = email;
        this.password = password;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            names: joi_1.default.string().trim().required(),
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(8).required(),
        });
        const { error, value } = schema.validate(data, { abortEarly: false });
        if (error) {
            return {
                errors: CreateUserDTO.formatValidationErrors(error.details)
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
exports.CreateUserDTO = CreateUserDTO;
