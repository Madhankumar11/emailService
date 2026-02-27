import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { log } from "console";

dotenv.config();

const app = express();
app.use(express.json());

// Create transporter using config values
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,      // from config
    pass: process.env.EMAIL_PASS       // app password
  }
});

// Single API
app.post("/send-email", async (req, res) => {
  try {
    const { description } = req.body;

    // Validate description
    if (!description || description.trim() === "") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Description is required",
        data: null
      });
    }

    // Professional Email Template
    const formattedBody = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
          
          <h2 style="color: #6b1e3d; border-bottom: 2px solid #f1f1f1; padding-bottom: 10px;">
            📩 New Request Received
          </h2>

          <p style="font-size: 14px; color: #555;">
            A new description has been submitted from your application.
          </p>

          <div style="background: #f4f4f4; padding: 15px; border-radius: 6px; margin-top: 15px;">
            <p style="white-space: pre-line; font-size: 14px; color: #333;">
              ${description}
            </p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated email notification from your system.
          </p>

        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Description Submitted",
      html: formattedBody
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Email sent successfully",
      data: null
    });

  } catch (error) {
    console.log("Error sending email:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
      data: null
    });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});