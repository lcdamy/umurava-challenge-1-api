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
exports.getAllJoinedChallenges = exports.approveRejectChallengeSubmission = exports.getChallengeSubmissions = exports.submitChallenge = exports.getParticipantChallenges = exports.countParticipants = exports.joinChallenge = void 0;
const challengeModel_1 = __importDefault(require("../../models/challengeModel"));
const challengeParticipantsModel_1 = __importDefault(require("../../models/challengeParticipantsModel"));
const helper_1 = require("../../utils/helper");
const http_status_codes_1 = require("http-status-codes");
const logger_1 = __importDefault(require("../../config/logger"));
const emailService_1 = require("../../utils/emailService");
const userService_1 = require("../../services/userService");
const notificationService_1 = require("../../services/notificationService");
const submitChallengeDTO_1 = require("../../dtos/submitChallengeDTO");
const JoinChallengeDTO = require('../../dtos/joinChallengeDTO');
const { FRONTEND_URL } = process.env;
const userService = new userService_1.UserSercice();
const notificationService = new notificationService_1.NoticationSercice();
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
        if (challenge.status == 'open') {
            const teamLeadEmail = req.user ? req.user.email : null;
            const participantsCount = (0, exports.countParticipants)(value, teamLeadEmail);
            if (challenge.teamSize !== participantsCount) {
                const errorMessage = `The challenge requires exactly ${challenge.teamSize} participants. You currently have ${participantsCount} participants. Please ensure the correct number of participants is provided.`;
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
                yield Promise.all(adminEmails.map((adminEmail) => (0, emailService_1.sendEmail)('send_notification', 'Participant Joined Challenge', adminEmail, Object.assign(Object.assign({}, context), { subject: 'Participant Joined Challenge', name: 'Admin', message: `A participant has joined the challenge: ${challenge.challengeName}.`, link: `${FRONTEND_URL}/login`, link_label: 'Login to Dashboard' })).catch(error => logger_1.default.error(`Error sending email to ${adminEmail}:`, error))));
                yield Promise.all(admins.map((admin) => notificationService.createNotification({
                    timestamp: new Date(),
                    type: 'info',
                    title: 'Participant Joined Challenge',
                    message: `A participant has successfully joined the challenge: "${challenge.challengeName}". You can review their details in the admin dashboard.`,
                    userId: admin._id,
                    status: 'unread'
                })));
                logger_1.default.info('Notification sent to admins successfully');
            }
            else {
                logger_1.default.warn('No admins found');
            }
            const memberEmails = value.participants.members || [];
            yield Promise.all(memberEmails.map((member) => (0, emailService_1.sendEmail)('send_notification', 'You Have Been Added to a Challenge', member, Object.assign(Object.assign({}, context), { subject: 'You Have Been Added to a Challenge', name: 'Team Member', message: `You have been added to the challenge: ${challenge.challengeName}.`, link: `${FRONTEND_URL}/challenges/${challenge._id}`, link_label: 'View Challenge' })).catch(error => logger_1.default.error(`Error sending email to ${member}:`, error))));
            return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Participant joined the challenge successfully'));
        }
        else {
            const errorMessage = 'You can only join challenges that are open for participation';
            logger_1.default.warn(errorMessage);
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessage));
        }
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
//get all participants in a challenge
const getParticipantChallenges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('getParticipantChallenges API called!');
    try {
        const { challenge_id } = req.params;
        if (!challenge_id) {
            logger_1.default.warn('Challenge ID is required');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Challenge ID is required'));
        }
        // Check if the challenge exists
        const challenge = yield challengeModel_1.default.findById(challenge_id);
        if (!challenge) {
            logger_1.default.warn(`Challenge not found with id: ${challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        const participantChallenges = yield challengeParticipantsModel_1.default.find({ challengeId: challenge_id })
            .populate('teamLead', 'names profile_url email')
            .populate('members', 'email');
        if (!participantChallenges) {
            logger_1.default.warn(`No participants found for challenge with id: ${challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'No participants found for this challenge'));
        }
        logger_1.default.info('Participant challenges retrieved successfully', participantChallenges);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Participant challenges retrieved successfully', { participantChallenges }));
    }
    catch (error) {
        const errorMessage = error.message || 'Error retrieving participant challenges';
        logger_1.default.error('Error retrieving participant challenges', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.getParticipantChallenges = getParticipantChallenges;
//submit challenge
const submitChallenge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('submitChallenge API called!');
    const { errors, value } = submitChallengeDTO_1.SubmitChallengeDTO.validate(req.body);
    if (errors) {
        const errorMessages = errors.map((error) => error.message).join(', ');
        logger_1.default.error('Validation Error', errorMessages);
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', errorMessages));
    }
    try {
        const { challenge_id } = req.params;
        if (!challenge_id) {
            logger_1.default.warn('Challenge ID is required');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Challenge ID is required'));
        }
        const challenge = yield challengeModel_1.default.findById(challenge_id);
        if (!challenge) {
            logger_1.default.warn(`Challenge not found with id: ${challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        // only submit if the challenge is ongoing
        if (challenge.status !== 'ongoing') {
            logger_1.default.warn('Challenge is not ongoing');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'You can only submit the challenge if it is ongoing'));
        }
        const participant = yield challengeParticipantsModel_1.default.findOne({
            challengeId: challenge_id,
            teamLead: req.user ? req.user.id : null
        });
        if (!participant || participant.teamLead.toString() !== (req.user ? req.user.id : null)) {
            logger_1.default.warn('Only the team lead who joined the challenge can submit the challenge');
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json((0, helper_1.formatResponse)('error', 'Only the team lead who joined the challenge can submit the challenge'));
        }
        const currentDate = new Date();
        const submissionDate = challenge.endDate ? new Date(challenge.endDate) : null;
        if (submissionDate && currentDate > submissionDate) {
            logger_1.default.warn('Challenge submission date has passed');
            yield notifyAdminsOfLateSubmission(participant, req.user);
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Challenge submission date has passed'));
        }
        if (participant.submissionStatus === 'submitted') {
            logger_1.default.warn('Challenge already submitted by this participant');
            return res.status(http_status_codes_1.StatusCodes.CONFLICT).json((0, helper_1.formatResponse)('error', 'Challenge already submitted by this participant'));
        }
        participant.submissionStatus = 'submitted';
        participant.submissionDate = new Date();
        participant.submissionData = {
            details_message: value.details_message,
            links: value.links
        };
        yield participant.save();
        logger_1.default.info('Challenge submission data saved successfully', participant);
        yield notifyAdminsAndMembersOfSubmission(participant, challenge);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge submitted successfully'));
    }
    catch (error) {
        const errorMessage = error.message || 'Error submitting the challenge';
        logger_1.default.error('Error submitting the challenge', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.submitChallenge = submitChallenge;
//get participant challenge submissions
const getChallengeSubmissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('getChallengeSubmissions API called!');
    try {
        const { challenge_id } = req.params;
        if (!challenge_id) {
            logger_1.default.warn('Challenge ID is required');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Challenge ID is required'));
        }
        const challenge = yield challengeModel_1.default.findById(challenge_id);
        if (!challenge) {
            logger_1.default.warn(`Challenge not found with id: ${challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Challenge not found'));
        }
        const participantChallenges = yield challengeParticipantsModel_1.default.find({ challengeId: challenge_id, submissionStatus: 'submitted' })
            .populate('teamLead', 'names profile_url email')
            .populate('members', 'email');
        if (!participantChallenges) {
            logger_1.default.warn(`No participants who submitted their work found for challenge with id: ${challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'No participants who submitted their work found for this challenge'));
        }
        logger_1.default.info('Participants who submitted their work retrieved successfully', participantChallenges);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Participants who submitted their work retrieved successfully', { participantChallenges }));
    }
    catch (error) {
        const errorMessage = error.message || 'Error retrieving participant challenges';
        logger_1.default.error('Error retrieving participant challenges', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.getChallengeSubmissions = getChallengeSubmissions;
//approve or reject challenge submission
const approveRejectChallengeSubmission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.default.info('approveRejectChallengeSubmission API called!');
    try {
        const { submission_challenge_id } = req.params;
        const { status } = req.body;
        if (!submission_challenge_id) {
            logger_1.default.warn('Submission Challenge ID is required');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Submission Challenge ID is required'));
        }
        if (!['approved', 'rejected'].includes(status)) {
            logger_1.default.warn('Invalid status provided');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'Invalid status. Status must be either "approved" or "rejected"'));
        }
        const participant = yield challengeParticipantsModel_1.default.findById(submission_challenge_id);
        if (!participant) {
            logger_1.default.warn(`Participant submission not found with id: ${submission_challenge_id}`);
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'Participant submission not found'));
        }
        participant.submissionStatus = status;
        if (status === 'rejected') {
            participant.rejectionReason = "Your submission has been rejected. However, your work was among the best we received. We encourage you to try the next challenge as the Umurava platform has many exciting challenges coming in the future. Keep up the great work!";
        }
        yield participant.save();
        logger_1.default.info('Challenge submission status updated successfully', { id: participant._id, status });
        const context = {
            year: new Date().getFullYear(),
            logo_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfOXMNnYUnd7jDT5v7LsNK8T23Wa5gBM0jQQ&s",
            subject: '',
            name: '',
            message: '',
            link: '',
            link_label: ''
        };
        const getTeamLeadEmail = (teamLeadId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const user = yield userService.getUserById(teamLeadId);
                return (user === null || user === void 0 ? void 0 : user.email) || null;
            }
            catch (error) {
                logger_1.default.error(`Error fetching team lead email for ID: ${teamLeadId}`, error);
                return null;
            }
        });
        const teamLeadEmail = yield getTeamLeadEmail(participant.teamLead.toString());
        const memberEmails = [...(participant.members || [])];
        if (teamLeadEmail && !memberEmails.includes(teamLeadEmail)) {
            memberEmails.push(teamLeadEmail);
        }
        const message = status === 'approved'
            ? `Your submission has been approved. Congratulations on your outstanding work! Keep up the great effort and continue to excel in future challenges. You have moved to the next stage and will be contacted in a few days.`
            : `Your submission has been rejected. However, your work was among the best we received. We encourage you to try the next challenge as the Umurava platform has many exciting challenges coming in the future. Keep up the great work!`;
        yield Promise.all(memberEmails.map((email) => (0, emailService_1.sendEmail)('send_notification', 'Challenge Submission Status Updated', email, Object.assign(Object.assign({}, context), { subject: 'Challenge Submission Status Updated', name: 'Team Member', message, link: `${FRONTEND_URL}/challenges/${participant.challengeId}`, link_label: 'View Challenge' })).catch(error => logger_1.default.error(`Error sending email to ${email}:`, error))));
        logger_1.default.info('Challenge submission status email sent to team members successfully');
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'Challenge submission status updated successfully'));
    }
    catch (error) {
        const errorMessage = error.message || 'Error updating challenge submission status';
        logger_1.default.error('Error updating challenge submission status', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.approveRejectChallengeSubmission = approveRejectChallengeSubmission;
//get all challenges participant joined + all public challenges
const getAllJoinedChallenges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const searchQuery = search
        ? { $or: [{ challengeName: { $regex: search, $options: 'i' } }, { projectDescription: { $regex: search, $options: 'i' } }] }
        : {};
    if (status) {
        searchQuery.status = status;
    }
    try {
        logger_1.default.info('getAllJoinedChallenges API called with query', { page, limit, search, status });
        const userId = req.user ? req.user.id : null;
        if (!userId) {
            logger_1.default.warn('User ID is required');
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json((0, helper_1.formatResponse)('error', 'User ID is required'));
        }
        const [openChallenges, joinedChallenges] = yield Promise.all([
            challengeModel_1.default.find(Object.assign(Object.assign({}, searchQuery), { status: 'open' })).sort({ createdAt: -1 }),
            challengeParticipantsModel_1.default.find({ teamLead: userId })
                .populate('challengeId', 'challengeName status startDate endDate')
                .populate('members', 'email')
        ]);
        const challengesFromJoinedChallenges = yield Promise.all(joinedChallenges.map((joinedChallenge) => __awaiter(void 0, void 0, void 0, function* () {
            const challenge = joinedChallenge.challengeId;
            if (!challenge) {
                logger_1.default.warn(`Challenge not found for participation with id: ${joinedChallenge._id}`);
                return null;
            }
            const fullChallengeData = yield challengeModel_1.default.findById(challenge).lean();
            if (!fullChallengeData) {
                logger_1.default.warn(`Full challenge data not found for challenge with id: ${challenge}`);
                return null;
            }
            return Object.assign(Object.assign({}, fullChallengeData), { teamLead: joinedChallenge.teamLead, members: joinedChallenge.members });
        })));
        const validJoinedChallenges = challengesFromJoinedChallenges.filter((joinedChallenge) => joinedChallenge !== null);
        const challenges = openChallenges.map((openChallenge) => {
            const joinedChallenge = validJoinedChallenges.find((joinedChallenge) => { var _a, _b; return ((_a = joinedChallenge._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = openChallenge._id) === null || _b === void 0 ? void 0 : _b.toString()); });
            return Object.assign(Object.assign({}, openChallenge.toObject()), { joined_status: !!joinedChallenge || validJoinedChallenges.some((jc) => { var _a, _b; return ((_a = jc._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = openChallenge._id) === null || _b === void 0 ? void 0 : _b.toString()); }) });
        }).concat(validJoinedChallenges.map((joinedChallenge) => (Object.assign(Object.assign({}, joinedChallenge), { joined_status: true })))).filter((challenge, index, self) => index === self.findIndex((c) => { var _a, _b; return ((_a = c._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = challenge._id) === null || _b === void 0 ? void 0 : _b.toString()); }));
        const filteredChallenges = challenges.filter((challenge) => {
            if (status) {
                return challenge.status === status;
            }
            return true;
        });
        const totalChallenges = filteredChallenges.length;
        const totalCompletedChallenges = filteredChallenges.filter((challenge) => challenge.status === 'completed').length;
        const totalOpenChallenges = filteredChallenges.filter((challenge) => challenge.status === 'open').length;
        const totalOngoingChallenges = filteredChallenges.filter((challenge) => challenge.status === 'ongoing').length;
        const paginatedChallenges = filteredChallenges.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);
        if (paginatedChallenges.length === 0) {
            logger_1.default.warn('No challenges found');
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json((0, helper_1.formatResponse)('error', 'No challenges found'));
        }
        logger_1.default.info('All challenges retrieved successfully', paginatedChallenges);
        return res.status(http_status_codes_1.StatusCodes.OK).json((0, helper_1.formatResponse)('success', 'All challenges retrieved successfully', {
            aggregates: { totalChallenges, totalCompletedChallenges, totalOpenChallenges, totalOngoingChallenges },
            challenges: paginatedChallenges,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalChallenges / limitNumber),
                pageSize: limitNumber,
                totalItems: totalChallenges
            }
        }));
    }
    catch (error) {
        const errorMessage = error.message || 'Error retrieving all challenges';
        logger_1.default.error('Error retrieving all challenges', errorMessage);
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json((0, helper_1.formatResponse)('error', errorMessage));
    }
});
exports.getAllJoinedChallenges = getAllJoinedChallenges;
// Notify admins of late submission
const notifyAdminsOfLateSubmission = (participant, user) => __awaiter(void 0, void 0, void 0, function* () {
    const admins = yield userService.getAdmins();
    if (admins && admins.length > 0) {
        const adminEmails = admins.map((admin) => admin.email);
        const context = {
            subject: 'Challenge Submission Attempt After Deadline',
            name: 'Admin',
            message: `A challenge submission attempt was made after the deadline by ${participant.teamLead} (${user ? user.email : 'Unknown Email'}).`,
            link: `${FRONTEND_URL}/login`,
            link_label: 'Login to Dashboard'
        };
        yield Promise.all(adminEmails.map((adminEmail) => (0, emailService_1.sendEmail)('send_notification', 'Challenge Submission Attempt After Deadline', adminEmail, context)
            .catch(error => logger_1.default.error(`Error sending email to ${adminEmail}:`, error))));
        yield Promise.all(admins.map((admin) => notificationService.createNotification({
            timestamp: new Date(),
            type: 'warning',
            title: 'Late Challenge Submission Attempt',
            message: `A late submission attempt was made for the challenge by team lead ${participant.teamLead}. Please review the details in the admin dashboard.`,
            userId: admin._id,
            status: 'unread'
        })));
        logger_1.default.info('Notification sent to admins successfully');
    }
    else {
        logger_1.default.warn('No admins found');
    }
});
const notifyAdminsAndMembersOfSubmission = (participant, challenge) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield Promise.all(adminEmails.map((adminEmail) => (0, emailService_1.sendEmail)('send_notification', 'Challenge Submitted', adminEmail, Object.assign(Object.assign({}, context), { subject: 'Challenge Submitted', name: 'Admin', message: `A challenge has been submitted by ${participant.teamLead}.`, link: `${FRONTEND_URL}/login`, link_label: 'Login to Dashboard' })).catch(error => logger_1.default.error(`Error sending email to ${adminEmail}:`, error))));
        yield Promise.all(admins.map((admin) => notificationService.createNotification({
            timestamp: new Date(),
            type: 'info',
            title: 'New Challenge Submission',
            message: `A new challenge submission has been made by team lead ${participant.teamLead}. Please review the submission details in the admin dashboard.`,
            userId: admin._id,
            status: 'unread'
        })));
        logger_1.default.info('Notification sent to admins successfully');
    }
    else {
        logger_1.default.warn('No admins found');
    }
    const memberEmails = participant.members || [];
    yield Promise.all(memberEmails.map((member) => (0, emailService_1.sendEmail)('send_notification', 'Challenge Submitted', member, Object.assign(Object.assign({}, context), { subject: 'Challenge Submitted', name: 'Team Member', message: `The challenge has been submitted by ${participant.teamLead}.`, link: `${FRONTEND_URL}/challenges/${challenge._id}`, link_label: 'View Challenge' })).catch(error => logger_1.default.error(`Error sending email to ${member}:`, error))));
    logger_1.default.info('Challenge submission email sent to team members successfully');
});
