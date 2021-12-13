import express from 'express';
import SendMailRoute from './routes/send-mail'
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors())
app.set('trust proxy', true)

/**
 * @description Send mail routes
 */
app.use(SendMailRoute)
app.get('*', (req, res) => {
    res.redirect("https://simplemail-next.vercel.app")
})

export default app;