import config from '../config'
import request from 'supertest'
import server from '../app'

describe('Send email endpoint', () => {
    it('POST /send-email/:email should able to send email', async () => {
        const res = await request(server)
            .post('/send-email')
            .send({
                "email": config.fromEmail,
                "from": config.fromEmail,
                "subject": "Send email",
                "text": "Testing",
                "method": "POST",
                "html": "<h3>Test mail endpoint</h3>",
                "smtp_pass": config.smtpAppPass,
                "smtp_user": config.fromEmail,
            });
        expect(res.status).toEqual(201)
    })
})