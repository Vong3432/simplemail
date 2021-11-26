import { Job } from 'bullmq'
import nodemailer from 'nodemailer'
import { GmailAuthConfig } from '../interfaces/gmail-auth.interface'
import { MailJob } from '../interfaces/mail.interface'
import config from '../config'
import { decrypt, EncryptedResult } from '../helpers/encryption/crypto'

export default async (job: Job<EncryptedResult>) => {
    // let attachments;

    // if (job.data.htmlAttachments) {
    //     attachments = await Promise.all(
    //         job.data.htmlAttachments.map(async (attachment) => {
    //             const browser = await puppeteer.launch({
    //                 headless: true,
    //                 args: ["--no-sandbox", "--disable-setuid-sandbox"],
    //             });
    //             const page = await browser.newPage();

    //             await page.setContent(attachment.html);

    //             const pdf = await page.pdf({ format: "a4", printBackground: true });

    //             await browser.close();

    //             return { filename: `${attachment.name}.pdf`, content: pdf };
    //         })
    //     );
    // }
    const decrypted = decrypt<GmailAuthConfig & MailJob>(job.data)
    console.log(`Decrypted ${JSON.stringify(decrypted)}`)

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: decrypted.user,
            pass: decrypted.password,
        }
    })

    console.log(
        `Job #${job.id} Calling mail-hook, attempt ${job.attemptsMade + 1} of ${config.maxAttemptsForEmail}`
    );

    const info = await transporter.sendMail({
        ...decrypted.mailOpts,
        // attachments
    })

    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)

    return info

}
