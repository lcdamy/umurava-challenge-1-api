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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const logger_1 = __importDefault(require("../config/logger"));
const { GMAIL_EMAIL, GMAIL_PASSWORD } = process.env;
if (!GMAIL_EMAIL || !GMAIL_PASSWORD) {
    throw new Error('Missing required environment variables');
}
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: GMAIL_EMAIL,
        pass: GMAIL_PASSWORD
    }
});
const loadTemplate = (templateName, context) => {
    const filePath = path_1.default.resolve(process.cwd(), 'src/emailTemplates', `${templateName}.html`);
    logger_1.default.info(`Loading email template from: ${filePath}`);
    const source = fs_1.default.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars_1.default.compile(source);
    return template(context);
};
const sendEmail = (templateName, subject, email, context) => __awaiter(void 0, void 0, void 0, function* () {
    const html = loadTemplate(templateName, context);
    const mailOptions = {
        from: GMAIL_EMAIL,
        to: email,
        subject: subject,
        text: context.message,
        html: html
    };
    try {
        const result = yield transporter.sendMail(mailOptions);
        return result;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
