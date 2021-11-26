import { SendMailRequestBody } from "./send-email-schema-check"
import { Request, Response } from 'express'
import { encrypt, EncryptedResult } from "../helpers/encryption/crypto"

import { MailJob } from "../interfaces/mail.interface";
import { GmailAuthConfig } from "../interfaces/gmail-auth.interface";

export default function encryptBody(req: Request<any, any, SendMailRequestBody & { encrypted: EncryptedResult, }, any>, res: Response, next: any) {
    const encrypted = encrypt<GmailAuthConfig & MailJob>({
        mailOpts: {
            from: req.body.from,
            subject: req.body.subject,
            text: req.body.text,
            to: req.body.email,
            html: req.body.html,
        },
        user: req.body.smtp_user,
        password: req.body.smtp_pass
    });
    req.body.encrypted = encrypted

    next()
}