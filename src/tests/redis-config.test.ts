import config from '../config'
import request from 'supertest'
import server from '../app'

describe('Redis configuration', () => {
    it('Ensure redis credential can be extracted from env variable', async () => {
        const fakedTLSUrl = "rediss://:aishduh1ui23h1ui23h@ec122-123-123-123-123.compute-123.amazonaws.com:17621"

        // find index before substring
        const passwordIndex = fakedTLSUrl.indexOf("rediss://:") + 10 // "rediss://:" length is 10
        const hostIndex = fakedTLSUrl.indexOf("@") + 1
        const portIndex = fakedTLSUrl.lastIndexOf(":") + 1

        // extract
        const host = fakedTLSUrl.substring(hostIndex, portIndex - 1)
        const password = fakedTLSUrl.substring(passwordIndex, hostIndex - 1)
        const port = fakedTLSUrl.substring(portIndex)

        expect(host).toEqual("ec122-123-123-123-123.compute-123.amazonaws.com")
        expect(password).toEqual("aishduh1ui23h1ui23h")
        expect(port).toEqual("17621")
    })
})