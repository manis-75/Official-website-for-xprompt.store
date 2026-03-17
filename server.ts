import express from "express";
import { createServer as createViteServer } from "vite";
import { Readable } from "stream";
import nodemailer from "nodemailer";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit per file
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for reporting issues
  app.post("/api/report-issue", upload.array("attachments", 5), async (req, res) => {
    try {
      const { title, description, email } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      // Check if SMTP credentials are provided
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpUser && smtpPass) {
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // Prepare attachments for nodemailer
        const mailAttachments = files?.map(file => ({
          filename: file.originalname,
          content: file.buffer,
          contentType: file.mimetype,
        })) || [];

        const mailOptions = {
          from: smtpUser,
          to: 'Xprompt.store@gmail.com',
          subject: `New Issue Reported: ${title}`,
          text: `
You have received a new issue report from Xprompt.store.

Title: ${title}
User Email: ${email || 'Not provided'}

Description:
${description}
          `,
          attachments: mailAttachments,
        };

        await transporter.sendMail(mailOptions);
        console.log("Issue report email sent successfully with attachments.");
      } else {
        // Fallback for development/preview if SMTP is not configured
        console.log("==================================================");
        console.log("NEW ISSUE REPORTED (SMTP not configured)");
        console.log(`Title: ${title}`);
        console.log(`Email: ${email || 'Not provided'}`);
        console.log(`Description: ${description}`);
        console.log(`Attachments: ${files?.length || 0} file(s)`);
        files?.forEach((f, i) => console.log(`  - File ${i + 1}: ${f.originalname} (${f.mimetype}, ${f.size} bytes)`));
        console.log("==================================================");
        console.log("To enable actual email sending, set SMTP_USER and SMTP_PASS environment variables.");
      }

      res.status(200).json({ success: true, message: "Report sent successfully" });
    } catch (error) {
      console.error("Error processing report issue:", error);
      res.status(500).json({ error: "Failed to send report" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
