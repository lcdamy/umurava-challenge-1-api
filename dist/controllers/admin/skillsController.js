"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSkill = exports.updateSkill = exports.createSkill = exports.getSkillById = exports.getSkills = void 0;
const skillsModel_1 = __importDefault(require("../../models/skillsModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const SkillDTO = require('../../dtos/skillsDTO');
const logger_1 = __importDefault(require("../../config/logger"));
// Get all skills
const getSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skills = yield skillsModel_1.default.find({ status: "active" });
        logger_1.default.info('Skills fetched successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Skills fetched successfully', skills));
    }
    catch (error) {
        logger_1.default.error('Error fetching skills', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching skills', error));
    }
});
exports.getSkills = getSkills;
// Get a single skill by ID
const getSkillById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skill = yield skillsModel_1.default.findById(req.params.id);
        if (!skill) {
            logger_1.default.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Skill not found'));
        }
        logger_1.default.info(`Skill fetched successfully with ID: ${req.params.id}`);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Skill fetched successfully', skill));
    }
    catch (error) {
        logger_1.default.error('Error fetching skill', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching skill', error));
    }
});
exports.getSkillById = getSkillById;
// Create a new skill
const createSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation Error', errors);
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
    }
    try {
        const newSkill = new skillsModel_1.default(value);
        const savedSkill = yield newSkill.save();
        logger_1.default.info('Skill created successfully');
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'Skill created successfully', savedSkill));
    }
    catch (error) {
        logger_1.default.error('Error creating skill', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error creating skill', error));
    }
});
exports.createSkill = createSkill;
// Update an existing skill
const updateSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = SkillDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation Error', errors);
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
    }
    try {
        const updatedSkill = yield skillsModel_1.default.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedSkill) {
            logger_1.default.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Skill not found'));
        }
        logger_1.default.info(`Skill updated successfully with ID: ${req.params.id}`);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Skill updated successfully', updatedSkill));
    }
    catch (error) {
        logger_1.default.error('Error updating skill', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error updating skill', error));
    }
});
exports.updateSkill = updateSkill;
// Delete a skill
const deleteSkill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedSkill = yield skillsModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedSkill) {
            logger_1.default.warn(`Skill not found with ID: ${req.params.id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Skill not found'));
        }
        logger_1.default.info(`Skill deleted successfully with ID: ${req.params.id}`);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Skill deleted successfully'));
    }
    catch (error) {
        logger_1.default.error('Error deleting skill', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error deleting skill', error));
    }
});
exports.deleteSkill = deleteSkill;
