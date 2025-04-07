"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
class ChallengePrizeDTO {
    constructor(id, prizeName, currency, description) {
        this.id = id;
        this.prizeName = prizeName;
        this.currency = currency;
        this.description = description;
    }
    // Add a method to validate the data using Joi
    static validate(data) {
        const schema = joi_1.default.object({
            prizeName: joi_1.default.string().required(),
            currency: joi_1.default.string().required(),
            description: joi_1.default.string().optional()
        });
        const { error, value } = schema.validate(data, { abortEarly: false });
        if (error) {
            return {
                errors: ChallengePrizeDTO.formatValidationErrors(error.details)
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
module.exports = ChallengePrizeDTO;
