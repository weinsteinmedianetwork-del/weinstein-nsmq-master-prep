const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.get("/", (req, res) => {
res.send("WEINSTEIN NSMQ MASTER PREP payment server is running.");
});

app.get("/api/paystack/verify", async (req, res) => {
const reference = req.query.reference;

if (!reference) {
return res.status(400).json({
verified: false,
message: "Payment reference is required."
});
}

if (!PAYSTACK_SECRET_KEY) {
return res.status(500).json({
verified: false,
message: "Payment server configuration is incomplete."
});
}

try {
const response = await fetch(
"https://api.paystack.co/transaction/verify/" +
encodeURIComponent(reference),
{
headers: {
Authorization: "Bearer ${PAYSTACK_SECRET_KEY}",
Accept: "application/json"
}
}
);

const result = await response.json();
const transaction = result.data;

const verified =
  response.ok &&
  result.status === true &&
  transaction &&
  transaction.status === "success" &&
  transaction.amount === 2000 &&
  transaction.currency === "GHS";

return res.status(200).json({
  verified: Boolean(verified),
  message: verified
    ? "Payment verified."
    : "Payment could not be verified."
});

} catch (error) {
console.error("Paystack verification failed:", error.message);

return res.status(502).json({
  verified: false,
  message: "Unable to verify payment at this time."
});

}
});

app.listen(PORT, "0.0.0.0", () => {
console.log("Payment server listening on port ${PORT}");
});
