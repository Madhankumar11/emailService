import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const app = express();
app.use(express.json());


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Authorization header missing",
      data: null
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "Invalid or expired token",
      data: null
    });
  }

  next();
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ============================
   📩 Send Email API
============================ */
app.post("/send-email", authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;
    console.log("Received description:", process.env.EMAIL_USER, process.env.EMAIL_PASS);

    if (!description || description.trim() === "") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Description is required",
        data: null
      });
    }

    const formattedBody = `
      <div style="font-family: Arial; padding:20px;">
        <h2>📩 New Request Received</h2>
        <div style="background:#f4f4f4; padding:15px; border-radius:6px;">
          <p>${description}</p>
        </div>
        <p style="font-size:12px; color:#999;">
          Automated email notification.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Description Submitted",
      html: formattedBody
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Email sent successfully",
      data: null
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
      data: null
    });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});