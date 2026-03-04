const express = require("express");
const { userAuth } = require("../middleware/auth");
const { instance } = require("../utils/razorpay");
const Payment = require("../modules/payment");
const { PaymentAmount, PaymentCurrency } = require("../utils/constant");

const paymentRouter = express.Router(); // ✅ FIXED

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    console.log("asfasdfasdfsda", req);
    const { notes, membershipType } = req.body;
    const { firstName, lastName } = notes;
    const type = membershipType?.toUpperCase();
    const response = await instance.orders.create({
      amount: PaymentAmount[type] * 100, // ₹1000
      currency: PaymentCurrency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        firstName,
        lastName,
        membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      // paymentId: response.id,
      orderId: response.id,
      status: response.status,
      amount: response.amount,
      currency: response.currency,
      receipt: response.receipt,
      notes: response.notes,
    });
    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), KeyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);

    res.status(400).json({
      message: err?.error?.description || err.message || "Payment failed",
    });
  }
});

module.exports = { paymentRouter };
