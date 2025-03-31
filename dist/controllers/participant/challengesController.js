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
exports.joinChallenge = void 0;
const challengeModel_1 = __importDefault(require("../../models/challengeModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
const logger_1 = __importDefault(require("../../config/logger"));
const emailService_1 = require("../../utils/emailService");
// Participate join the challenge api
const joinChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('joinChallenge API called!');
    const { errors, value } = JoinChallengeDTO.validate(req.body);
    if (errors) {
        logger_1.default.error('Validation Error', errors);
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Validation Error', errors));
    }
    try {
        const challenge = yield challengeModel_1.default.findById(req.params.id);
        if (!challenge) {
            logger_1.default.warn(`Challenge not found with id: ${req.params.id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        challenge.joinChallenge(value.participant);
        logger_1.default.info(`Participant joined the challenge successfully:: ${challenge.challengeName}`);
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: 'Participant Joined Challenge',
            name: 'admin',
            message: '',
            link: 'https://umurava-skills-challenge-xi.vercel.app/admin/dashboard',
            link_label: 'Login Now'
        };
        const sendWelcomeEmail = (message, linkLabel) => __awaiter(void 0, void 0, void 0, function* () {
            context.message = message;
            context.link_label = linkLabel;
            yield (0, emailService_1.sendEmail)('send_notification', 'Participant Joined Challenge', 'zudanga@gmail.com', context)
                .then(result => logger_1.default.info('Email sent:', result))
                .catch(error => logger_1.default.error('Error sending email:', error));
        });
        yield sendWelcomeEmail(`Participant has joined the challenge: ${challenge.challengeName}`, 'Log In Now');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Participant joined the challenge successfully'));
    }
    catch (error) {
        logger_1.default.error('Error joining the challenge', error);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', 'Error joining the challenge', error));
    }
});
exports.joinChallenge = joinChallenge;
