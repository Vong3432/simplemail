import crypto from 'crypto'
import { SendMailRequestBody } from '../../middlewares/send-email-schema-check';
import { MailJob } from '../../interfaces/mail.interface'
import config from '../../config';
import { GmailAuthConfig } from '../../interfaces/gmail-auth.interface';

const algorithm = config.encryption.algorithm!;
const secretKey = config.encryption.secretKey!;
const iv = crypto.randomBytes(16);

export type EncryptedResult = {
    iv: string;
    content: string
}

export type DecryptedResult = MailJob & GmailAuthConfig

export const encrypt = <T>(body: T) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const bodyText = JSON.stringify(body)
    const encrypted = Buffer.concat([cipher.update(bodyText), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

export const decrypt = <T>(hash: EncryptedResult): T => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    const descryptedStr = decrpyted.toString();

    return JSON.parse(descryptedStr)
};