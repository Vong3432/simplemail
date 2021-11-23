import supertest from 'supertest'
import server from '../index'

const requestWithSupertest = supertest(server)

describe('Send email endpoint', () => {
    it('POST /send-email/:email should able to send email', async () => {
        const res = await requestWithSupertest.post('/send-email?email=abc@gmail.com&from=abc@gmail.com&subject=Hello world&text=Test email&callback_url=https://www.google.com&method=GET');
        expect(res.status).toEqual(201)
    })
})