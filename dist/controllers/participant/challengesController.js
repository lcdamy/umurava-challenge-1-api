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
exports.countParticipants = exports.joinChallenge = void 0;
const challengeModel_1 = __importDefault(require("../../models/challengeModel"));
const challengeParticipantsModel_1 = __importDefault(require("../../models/challengeParticipantsModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const emailService_1 = require("../../utils/emailService");
const userService_1 = require("../../services/userService");
const notificationService_1 = require("../../services/notificationService");
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
const userService = new userService_1.UserSercice();
// Participate join the challenge API
const joinChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('joinChallenge API called!');
    try {
        const { errors, value } = JoinChallengeDTO.validate(req.body);
        if (errors) {
            const errorMessages = errors.map((error) => error.message).join(', ');
            logger_1.default.error('Validation Error', errorMessages);
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages));
        }
        const challenge = yield challengeModel_1.default.findById(req.params.id);
        if (!challenge) {
            logger_1.default.warn(`Challenge not found with id: ${req.params.id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        const teamLeadEmail = req.user ? req.user.email : null;
        const participantsCount = (0, exports.countParticipants)(value, teamLeadEmail);
        if (challenge.teamSize !== participantsCount) {
            const errorMessage = `The challenge requires exactly ${challenge.teamSize} participants. Please ensure the correct number of participants is provided.`;
            logger_1.default.warn(errorMessage);
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessage));
        }
        const existingParticipant = yield challengeParticipantsModel_1.default.findOne({
            challengeId: req.params.id,
            teamLead: req.user ? req.user.id : null
        });
        if (existingParticipant) {
            const errorMessage = 'Participant is already part of this challenge';
            logger_1.default.warn(errorMessage);
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', errorMessage));
        }
        const participant = new challengeParticipantsModel_1.default({
            challengeId: req.params.id,
            teamLead: req.user && req.user.id ? req.user.id : 'Unknown',
            members: value.participants.members || [],
        });
        yield participant.save();
        logger_1.default.info('Participant joined the challenge successfully', participant);
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: '',
            name: '',
            message: '',
            link: '',
            link_label: ''
        };
        const admins = yield userService.getAdmins();
        if (admins && admins.length > 0) {
            const adminEmails = admins.map((admin) => admin.email);
            yield Promise.all(adminEmails.map((adminEmail) => (0, emailService_1.sendEmail)('send_notification', 'Participant Joined Challenge', adminEmail, Object.assign(Object.assign({}, context), { subject: 'Participant Joined Challenge', name: 'Admin', message: `A participant has joined the challenge: ${challenge.challengeName}.`, link: 'https://umurava-skills-challenge-xi.vercel.app/admin/dashboard', link_label: 'View Dashboard' })).catch(error => logger_1.default.error(`Error sending email to ${adminEmail}:`, error))));
            const notificationService = new notificationService_1.NoticationSercice();
            yield Promise.all(admins.map((admin) => notificationService.createNotification({
                timestamp: new Date(),
                type: 'info',
                message: `A new user has registered on the platform. Please review their details.`,
                userId: admin._id,
                status: 'unread'
            })));
            logger_1.default.info('Notification sent to admins successfully');
        }
        else {
            logger_1.default.warn('No admins found');
        }
        const memberEmails = value.participants.members || [];
        yield Promise.all(memberEmails.map((member) => (0, emailService_1.sendEmail)('send_notification', 'You Have Been Added to a Challenge', member, Object.assign(Object.assign({}, context), { subject: 'You Have Been Added to a Challenge', name: 'Team Member', message: `You have been added to the challenge: ${challenge.challengeName}.`, link: `https://umurava-skills-challenge-xi.vercel.app/challenges/${challenge._id}`, link_label: 'View Challenge' })).catch(error => logger_1.default.error(`Error sending email to ${member}:`, error))));
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Participant joined the challenge successfully'));
    }
    catch (error) {
        const errorMessage = error.message || 'Error joining the challenge';
        logger_1.default.error('Error joining the challenge', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.joinChallenge = joinChallenge;
//count the number of participants in a challenge
const countParticipants = (object, teamLead) => {
    try {
        const { participants } = object;
        const uniqueParticipants = new Set([teamLead, ...(participants.members || [])]);
        return uniqueParticipants.size;
    }
    catch (error) {
        logger_1.default.error('Error counting participants', error);
        throw new Error('Failed to count participants');
    }
};
exports.countParticipants = countParticipants;
