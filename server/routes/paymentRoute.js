import express from 'express'
import authUser from '../middlewares/authUser.js'
import {
  getPaymentQuote,
  initPayment,
  confirmPayment
} from '../controllers/paymentController.js'

const paymentRouter = express.Router()

paymentRouter.get('/quote', authUser, getPaymentQuote)
paymentRouter.post('/init', authUser, initPayment)
paymentRouter.post('/confirm', authUser, confirmPayment)

export default paymentRouter
