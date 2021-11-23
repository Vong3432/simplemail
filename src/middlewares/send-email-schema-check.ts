import { Request, Response } from "express"
import { Method } from "got/dist/source"

export interface SendMailRequestBody {
    email: string;
    from: string;
    subject: string;
    text: string;
    callback_url: string;
    method: Method;
    smtp_user: string;
    smtp_pass: string;
    html?: string;
    callback_data?: {};
}

export default function checkSendEmailSchema(req: Request<any, any, SendMailRequestBody, any>, res: Response, next: any) {

    const {
        email,
        from,
        subject,
        text,
        callback_url,
        smtp_user,
        smtp_pass
    } = req.body

    if (!email || !from || !subject || !text || !callback_url || !smtp_pass || !smtp_user) {
        return res.status(500).json({
            msg: 'Invalid data passed'
        })
    }

    next()
}