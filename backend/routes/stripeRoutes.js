import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import stripe from 'stripe';
import Order from '../models/order.js';
import { isAuth } from '../utils.js';

const stripeRouter = express.Router();

// This is your test secret API key.
const Stripe = stripe(
  'sk_test_51Kjj2QSJxaR9wFZe11FfNgRDeLj3pOdEeJfKCIr4jo5E3CIQjPyg87Z959Yg51HptHmMZFGzq1u7KrpkMRR4wX0700OfZZRQd0'
);

const calculateOrderItems = async (items) => {
  const result = await Order.findById(items._id);
  const itemsPrice = result.orderItems.reduce(
    (a, c) => a + c.price * c.quantity,
    0
  );

  const totalPrice = itemsPrice + items.shippingPrice + items.taxPrice;
  const round = Math.ceil(totalPrice);

  return round;
};

// Payment Intent route.
stripeRouter.post(
  '/create-payment-intent',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { order } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await Stripe.paymentIntents.create({
      amount: (await calculateOrderItems(order)) * 100,
      currency: 'INR',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  })
);

export default stripeRouter;
