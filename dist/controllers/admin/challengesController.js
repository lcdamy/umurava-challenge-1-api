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
exports.updateGracePeriod = exports.updateChallengeStatus = exports.getPrizeCategories = exports.getChallengeCategories = exports.createChallengeCategory = exports.getChallengesStatistics = exports.deleteChallenge = exports.updateChallenge = exports.createChallenge = exports.getChallengeById = exports.getChallenges = void 0;
const challengeModel_1 = __importDefault(require("../../models/challengeModel"));
const challengeCategoryModel_1 = __importDefault(require("../../models/challengeCategoryModel"));
const prizesModel_1 = __importDefault(require("../../models/prizesModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const ChallengeDTO = require('../../dtos/challengesDTO');
const UpdateChallengeDTO = require('../../dtos/updateChallengeDTO');
const ChallengeCategoryDTO = require('../../dtos/challengeCategoryDTO');
const UpdateChallengeStatusDTO = require('../../dtos/updateChallengeStatusDTO');
const UpdateChallengeSubmissionDateDTO = require('../../dtos/updateChallengeSubmissionDateDTO');
// Get all challenges
const getChallenges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, search = '', all = 'false', status } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const searchQuery = search
        ? { $or: [{ challengeName: { $regex: search, $options: 'i' } }, { projectDescription: { $regex: search, $options: 'i' } }] }
        : {};
    if (status) {
        searchQuery.status = status;
    }
    try {
        logger_1.default.info('Fetching challenges with query', { page, limit, search, all, status });
        const totalChallenges = yield challengeModel_1.default.countDocuments(searchQuery);
        const totalCompletedChallenges = yield challengeModel_1.default.countDocuments(Object.assign(Object.assign({}, searchQuery), { status: 'completed' }));
        const totalOpenChallenges = yield challengeModel_1.default.countDocuments(Object.assign(Object.assign({}, searchQuery), { status: 'open' }));
        const totalOngoingChallenges = yield challengeModel_1.default.countDocuments(Object.assign(Object.assign({}, searchQuery), { status: 'ongoing' }));
        let challenges;
        if (all === 'true') {
            challenges = yield challengeModel_1.default.find(searchQuery).sort({ createdAt: -1 });
        }
        else {
            challenges = yield challengeModel_1.default.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);
        }
        logger_1.default.info('Challenges fetched successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenges fetched successfully', {
            aggregates: { totalChallenges, totalCompletedChallenges, totalOpenChallenges, totalOngoingChallenges },
            challenges,
            pagination: all === 'true' ? null : {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalChallenges / limitNumber),
                pageSize: limitNumber,
                totalItems: totalChallenges
            }
        }));
    }
    catch (error) {
        logger_1.default.error('Error fetching challenges', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching challenges', error));
    }
});
exports.getChallenges = getChallenges;
// Get a single challenge by ID
const getChallengeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Fetching challenge by ID', { id: req.params.id });
        const challenge = yield challengeModel_1.default.findById(req.params.id);
        if (!challenge) {
            logger_1.default.warn('Challenge not found', { id: req.params.id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        // Fetch participant data manually
        const challengeWithParticipants = Object.assign({}, challenge.toObject());
        logger_1.default.info('Challenge fetched successfully', { id: req.params.id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge fetched successfully', challengeWithParticipants));
    }
    catch (error) {
        logger_1.default.error('Error fetching challenge', { id: req.params.id, error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching challenge', error));
    }
});
exports.getChallengeById = getChallengeById;
// Create a new challenge
const createChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = ChallengeDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error creating challenge', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        // check if the challenge already exists
        const existingChallenge = yield challengeModel_1.default.findOne({ challengeName: value.challengeName });
        if (existingChallenge) {
            logger_1.default.warn('Challenge already exists', { challengeName: value.challengeName });
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', 'Challenge already exists'));
        }
        const startDate = (0, helper_1.convertToISO)(value.startDate);
        const endDate = (0, helper_1.convertToISO)(value.endDate);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const now = new Date();
        if (startDateObj < now || endDateObj < now || endDateObj <= startDateObj) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Invalid duration: start date must be in the future and end date must be after start date'));
        }
        const duration = (0, helper_1.getDuration)(endDate, startDate);
        const newChallenge = new challengeModel_1.default(Object.assign(Object.assign({}, value), { endDate, startDate, duration }));
        const savedChallenge = yield newChallenge.save();
        logger_1.default.info('Challenge created successfully', { id: savedChallenge._id });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'Challenge created successfully', savedChallenge));
    }
    catch (error) {
        logger_1.default.error('Error creating challenge', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error creating challenge', error));
    }
});
exports.createChallenge = createChallenge;
// Update an existing challenge
const updateChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = UpdateChallengeDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error updating challenge', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        const startDate = (0, helper_1.convertToISO)(value.startDate);
        const endDate = (0, helper_1.convertToISO)(value.endDate);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const now = new Date();
        if (startDateObj < now || endDateObj < now || endDateObj <= startDateObj) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Invalid duration: start date must be in the future and end date must be after start date'));
        }
        const duration = (0, helper_1.getDuration)(endDate, startDate);
        logger_1.default.info('Updating challenge', { id: req.params.id });
        const challenge = yield challengeModel_1.default.findById(req.params.id);
        if (!challenge) {
            logger_1.default.warn('Challenge not found for update', { id: req.params.id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        if (challenge.status === 'completed') {
            logger_1.default.warn('Attempted to update a completed challenge', { id: req.params.id });
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)('error', 'Cannot update a completed challenge'));
        }
        const updatedChallenge = yield challengeModel_1.default.findByIdAndUpdate(req.params.id, Object.assign(Object.assign({}, value), { endDate, startDate, duration }), { new: true });
        logger_1.default.info('Challenge updated successfully', { id: req.params.id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge updated successfully', updatedChallenge));
    }
    catch (error) {
        logger_1.default.error('Error updating challenge', { id: req.params.id, error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error updating challenge', error));
    }
});
exports.updateChallenge = updateChallenge;
// Delete a challenge
const deleteChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Deleting challenge', { id: req.params.id });
        const deletedChallenge = yield challengeModel_1.default.findByIdAndDelete(req.params.id);
        if (!deletedChallenge) {
            logger_1.default.warn('Challenge not found for deletion', { id: req.params.id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        logger_1.default.info('Challenge deleted successfully', { id: req.params.id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge deleted successfully'));
    }
    catch (error) {
        logger_1.default.error('Error deleting challenge', { id: req.params.id, error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error deleting challenge', error));
    }
});
exports.deleteChallenge = deleteChallenge;
// Get all challenges statistics
const getChallengesStatistics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Fetching challenges statistics');
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        const last30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        const previousWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
        const previous30Days = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60);
        const totalChallengesThisWeek = yield challengeModel_1.default.countDocuments({ createdAt: { $gte: lastWeek } });
        const totalChallengesPreviousWeek = yield challengeModel_1.default.countDocuments({ createdAt: { $gte: previousWeek, $lt: lastWeek } });
        const totalParticipantsThisWeek = yield challengeModel_1.default.distinct('participants', { createdAt: { $gte: lastWeek } });
        const totalParticipantsPreviousWeek = yield challengeModel_1.default.distinct('participants', { createdAt: { $gte: previousWeek, $lt: lastWeek } });
        const totalCompletedChallenges = yield challengeModel_1.default.countDocuments({ status: 'completed', updatedAt: { $gte: last30Days } });
        const totalCompletedChallengesPrevious = yield challengeModel_1.default.countDocuments({ status: 'completed', updatedAt: { $gte: previous30Days, $lt: last30Days } });
        const totalOngoingChallenges = yield challengeModel_1.default.countDocuments({ status: 'ongoing', updatedAt: { $gte: last30Days } });
        const totalOngoingChallengesPrevious = yield challengeModel_1.default.countDocuments({ status: 'ongoing', updatedAt: { $gte: previous30Days, $lt: last30Days } });
        const totalOpenChallenges = yield challengeModel_1.default.countDocuments({ status: 'open', createdAt: { $gte: last30Days } });
        const totalOpenChallengesPrevious = yield challengeModel_1.default.countDocuments({ status: 'open', createdAt: { $gte: previous30Days, $lt: last30Days } });
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0)
                return current === 0 ? 0 : 100;
            return ((current - previous) / previous) * 100;
        };
        const calculateChangeDirection = (current, previous) => {
            return current >= previous ? 'positive' : 'negative';
        };
        logger_1.default.info('Challenges statistics fetched successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenges statistics fetched successfully', {
            totalChallengesThisWeek,
            totalChallengesThisWeekChange: calculatePercentageChange(totalChallengesThisWeek, totalChallengesPreviousWeek),
            totalChallengesThisWeekChangeDirection: calculateChangeDirection(totalChallengesThisWeek, totalChallengesPreviousWeek),
            totalParticipantsThisWeek: totalParticipantsThisWeek.length,
            totalParticipantsThisWeekChange: calculatePercentageChange(totalParticipantsThisWeek.length, totalParticipantsPreviousWeek.length),
            totalParticipantsThisWeekChangeDirection: calculateChangeDirection(totalParticipantsThisWeek.length, totalParticipantsPreviousWeek.length),
            totalCompletedChallenges,
            totalCompletedChallengesChange: calculatePercentageChange(totalCompletedChallenges, totalCompletedChallengesPrevious),
            totalCompletedChallengesChangeDirection: calculateChangeDirection(totalCompletedChallenges, totalCompletedChallengesPrevious),
            totalOngoingChallenges,
            totalOngoingChallengesChange: calculatePercentageChange(totalOngoingChallenges, totalOngoingChallengesPrevious),
            totalOngoingChallengesChangeDirection: calculateChangeDirection(totalOngoingChallenges, totalOngoingChallengesPrevious),
            totalOpenChallenges,
            totalOpenChallengesChange: calculatePercentageChange(totalOpenChallenges, totalOpenChallengesPrevious),
            totalOpenChallengesChangeDirection: calculateChangeDirection(totalOpenChallenges, totalOpenChallengesPrevious)
        }));
    }
    catch (error) {
        logger_1.default.error('Error fetching challenges statistics', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching challenges statistics', error));
    }
});
exports.getChallengesStatistics = getChallengesStatistics;
// create challenge category
const createChallengeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = ChallengeCategoryDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error creating challenge category', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        // check if the challenge category already exists
        const existingCategory = yield challengeCategoryModel_1.default.findOne({ challengeCategoryName: value.challengeCategoryName });
        if (existingCategory) {
            logger_1.default.warn('Challenge category already exists', { challengeCategoryName: value.challengeCategoryName });
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', 'Challenge category already exists'));
        }
        const newChallengeCategory = new challengeCategoryModel_1.default(value);
        const savedChallengeCategory = yield newChallengeCategory.save();
        logger_1.default.info('Challenge category created successfully', { id: savedChallengeCategory._id });
        return res.status(http_status_codes_1.StatusCodes.CREATED).json((0, helper_1.formatResponse)('success', 'Challenge category created successfully', savedChallengeCategory));
    }
    catch (error) {
        logger_1.default.error('Error creating challenge category', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error creating challenge category', error));
    }
});
exports.createChallengeCategory = createChallengeCategory;
// Get all challenge categories
const getChallengeCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Fetching challenge categories');
        const categories = yield challengeCategoryModel_1.default.find({});
        logger_1.default.info('Challenge categories fetched successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge categories fetched successfully', categories));
    }
    catch (error) {
        logger_1.default.error('Error fetching challenge categories', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching challenge categories', error));
    }
});
exports.getChallengeCategories = getChallengeCategories;
// Get all prize categories
const getPrizeCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('Fetching prize categories');
        const categories = yield prizesModel_1.default.find({});
        logger_1.default.info('Prize categories fetched successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Prize categories fetched successfully', categories));
    }
    catch (error) {
        logger_1.default.error('Error fetching prize categories', { error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error fetching prize categories', error));
    }
});
exports.getPrizeCategories = getPrizeCategories;
// update challenge status
const updateChallengeStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = UpdateChallengeStatusDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error updating challenge status', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        const { id } = req.params;
        const { status } = value;
        logger_1.default.info('Fetching challenge for status update', { id });
        const challenge = yield challengeModel_1.default.findById(id);
        if (!challenge) {
            logger_1.default.warn('Challenge not found for status update', { id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        if (challenge.status === 'completed') {
            logger_1.default.warn('Attempted to update status of a completed challenge', { id });
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)('error', 'Cannot update status of a completed challenge'));
        }
        if (challenge.status === status) {
            logger_1.default.warn('Attempted to update status to the same value', { id, status });
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Status is already set to this value'));
        }
        logger_1.default.info('Updating challenge status', { id: req.params.id });
        const updatedChallenge = yield challengeModel_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedChallenge) {
            logger_1.default.warn('Challenge not found for status update', { id: req.params.id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        logger_1.default.info('Challenge status updated successfully', { id: req.params.id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge status updated successfully', updatedChallenge));
    }
    catch (error) {
        logger_1.default.error('Error updating challenge status', { id: req.params.id, error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error updating challenge status', error));
    }
});
exports.updateChallengeStatus = updateChallengeStatus;
// update grace period
const updateGracePeriod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { errors, value } = UpdateChallengeSubmissionDateDTO.validate(req.body);
    if (errors) {
        logger_1.default.warn('Validation error updating challenge grace period', { errors });
        const errorMessages = errors.map((error) => error.message).join(', ');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages, errors));
    }
    try {
        const { id } = req.params;
        const { new_submissionDate } = value;
        logger_1.default.info('Fetching challenge for grace period update', { id });
        const challenge = yield challengeModel_1.default.findById(id);
        if (!challenge) {
            logger_1.default.warn('Challenge not found for grace period update', { id });
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        if (new Date(new_submissionDate) <= new Date(challenge.endDate)) {
            logger_1.default.warn('Invalid grace period: must be after the challenge end date', { id, new_submissionDate });
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Invalid grace period: must be after the challenge end date'));
        }
        challenge.submissionDate = new Date(new_submissionDate);
        const updatedChallenge = yield challenge.save();
        logger_1.default.info('Challenge grace period updated successfully', { id });
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge grace period updated successfully', updatedChallenge));
    }
    catch (error) {
        console.error(error);
        logger_1.default.error('Error updating challenge grace period', { id: req.params.id, error });
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error updating challenge grace period', error));
    }
});
exports.updateGracePeriod = updateGracePeriod;
