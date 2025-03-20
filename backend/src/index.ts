import express, { Request, Response } from "express";
import cors from "cors";
import { sendEmail } from "./mailer";

const app = express();
app.use(express.json());

// ✅ Configure CORS properly
app.use(
  cors({
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Handle preflight requests
app.options("*", cors()); // This makes sure OPTIONS requests are handled properly

app.post("/send-message", async (req: Request, res: Response): Promise<void> => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400).json({ success: false, error: "⚠️ All fields are required!" });
    return;
  }

  try {
    await sendEmail(name, email, subject, message);
    res.status(200).json({ success: true, message: "✅ Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "❌ Failed to send message." });
  }
});

// ✅ Set the PORT dynamically for Vercel
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
