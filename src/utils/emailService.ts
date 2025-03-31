import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import logger from '../config/logger';
import dotenv from 'dotenv';
dotenv.config();

const { GMAIL_EMAIL, GMAIL_PASSWORD } = process.env;

if (!GMAIL_EMAIL || !GMAIL_PASSWORD) {
  throw new Error('Missing required environment variables');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_PASSWORD
  }
});

const loadTemplate = (templateName: string, context: any) => {
  const filePath = path.resolve(process.cwd(), 'src/emailTemplates', `${templateName}.html`);
  logger.info(`Loading email template from: ${filePath}`);
  const source = fs.readFileSync(filePath, 'utf-8').toString();
  const template = handlebars.compile(source);
  return template(context);
};

export const sendEmail = async (templateName: string, subject: string, email: string, context: any) => {
  const html = loadTemplate(templateName, context);
  const mailOptions = {
    from: GMAIL_EMAIL,
    to: email,
    subject: subject,
    text: context.message,
    html: html
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};