"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateRequest(dto) {
    return (req, res, next) => {
        const { error } = dto.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({ errors: error.details.map(detail => detail.message) });
        }
        next();
    };
}
module.exports = validateRequest;
