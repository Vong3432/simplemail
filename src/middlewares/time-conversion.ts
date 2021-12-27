import { Request, Response } from "express"
import { findMilliseconds } from "../helpers/schedule/time"


export type DelayRequestBody = {
    send_at: string;
    timezone?: string;
} & {
    delayInMs: number;
}

export default function timeConversion(req: Request<any, any, DelayRequestBody, any>, res: Response, next: any) {

    const {
        send_at,
        timezone = "Asia/Kuala_Lumpur"
    } = req.body

    if (send_at) {
        try {
            const delayInMs = findMilliseconds(send_at, timezone)
            req.body.delayInMs = delayInMs
        } catch (error) {
            return res.status(500).json({
                msg: `${error}`
            })
        }
    }

    next()
}