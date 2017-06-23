/* eslint-disable import/no-named-default */
import { default as fsOrig } from 'fs';
import pathModule            from 'path';
import nodemailer            from 'nodemailer';
import Handlebars            from 'handlebars';
import sendmailTransport     from 'nodemailer-sendmail-transport';
import smtpTransport         from 'nodemailer-smtp-transport';
import stubTransport         from 'nodemailer-stub-transport';
import { promisifyAll }      from 'bluebird';

import config from './../../etc/config';

const fs = promisifyAll(fsOrig);

class EmailSender {
    constructor() {
        let transport;

        switch (config.mail.transport) {
            case 'SMTP':
                transport = smtpTransport(config.mail.smtp);
                break;

            case 'SENDMAIL':
                transport = sendmailTransport();
                break;
            default:
                throw new Error('transport not fount');
        }

        const { TEST_MODE } = process.env;

        /* istanbul ignore next */
        if (TEST_MODE) {
            transport = stubTransport();
        }

        const options  = TEST_MODE ? { directory: '/tmp' } : config.mail.transport_options;

        this.transport = promisifyAll(nodemailer.createTransport(transport, options));
        this.templates = {};
    }

    async send(type, destinationUser, data) {
        const sendData = { ...data, mainUrl: config.mainUrl };
        const template = await this.getTemplates(type);

        const mailOptions = {
            from    : config.mail.from,
            to      : destinationUser,
            subject : template.subject(sendData),
            html    : template.body(sendData)
        };

        try {
            const response = await this.transport.sendMailAsync(mailOptions);

            return response.message;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async getTemplates(templateName) {
        if (!this.templates[templateName]) {
            const templatesDir = pathModule.join(__dirname, '/../../templates');

            const [bodyTemplate, subjectTemplate] = await Promise.all([
                fs.readFileAsync(pathModule.join(templatesDir, templateName, 'body.html')),
                fs.readFileAsync(pathModule.join(templatesDir, templateName, 'subject.html'))
            ]);

            this.templates[templateName] = {
                body    : Handlebars.compile(bodyTemplate.toString()),
                subject : Handlebars.compile(subjectTemplate.toString())
            };
        }

        return this.templates[templateName];
    }
}

export default new EmailSender();
