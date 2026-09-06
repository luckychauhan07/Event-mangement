const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
	path: path.resolve(__dirname, "../.env"),
});

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
});

/**
 * Send email verification OTP
 */
const sendVerificationOTP = async (email, otp) => {
	try {
		const mailOptions = {
			from: `"EaseEvent" <${process.env.MAIL_USER}>`,
			to: email,
			subject: "EaseEvent - Verify Your Email",
			html: `
				<div style="
					font-family: Arial, sans-serif;
					max-width: 500px;
					margin: auto;
					padding: 30px;
					border: 1px solid #e5e7eb;
					border-radius: 10px;
				">
					<h2 style="text-align: center;">
						Verify Your Email
					</h2>

					<p>Hello,</p>

					<p>
						Thank you for registering with <strong>EaseEvent</strong>.
						Use the OTP below to verify your email address.
					</p>

					<div style="
						text-align: center;
						margin: 30px 0;
					">
						<span style="
							font-size: 32px;
							font-weight: bold;
							letter-spacing: 8px;
							padding: 15px 25px;
							background: #f3f4f6;
							border-radius: 8px;
						">
							${otp}
						</span>
					</div>

					<p>
						This OTP is valid for <strong>5 minutes</strong>.
					</p>

					<p>
						If you did not create an EaseEvent account,
						you can safely ignore this email.
					</p>

					<hr style="border: none; border-top: 1px solid #e5e7eb;">

					<p style="
						text-align: center;
						color: #6b7280;
						font-size: 12px;
					">
						© EaseEvent
					</p>
				</div>
			`,
		};

		const info = await transporter.sendMail(mailOptions);

		return {
			success: true,
			messageId: info.messageId,
		};
	} catch (error) {
		console.error("Error sending verification email:", error);

		return {
			success: false,
			error: error.message,
		};
	}
};

const sendPasswordResetOTP = async (email, otp) => {
	try {
		const mailOptions = {
			from: `"EaseEvent" <${process.env.MAIL_USER}>`,
			to: email,
			subject: "EaseEvent - Password Reset OTP",
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 10px;">
					<h2 style="text-align: center;">Reset Your Password</h2>
					<p>Use the OTP below to reset your EaseEvent password.</p>
					<div style="text-align: center; margin: 30px 0;">
						<span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 25px; background: #f3f4f6; border-radius: 8px;">${otp}</span>
					</div>
					<p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a reset, you can safely ignore this email.</p>
				</div>
			`,
		};

		const info = await transporter.sendMail(mailOptions);

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending password reset OTP:", error);
		return { success: false, error: error.message };
	}
};

module.exports = {
	sendVerificationOTP,
	sendPasswordResetOTP,
};
