"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("./admin"));
const participant_1 = __importDefault(require("./participant"));
const public_1 = __importDefault(require("./public"));
const auth_1 = __importDefault(require("./auth"));
const router = express_1.default.Router();
router.use('/admin', admin_1.default);
router.use('/participant', participant_1.default);
router.use('/public', public_1.default);
router.use('/auth', auth_1.default);
exports.default = router;
