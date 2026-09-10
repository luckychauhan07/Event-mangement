// const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const MAIL_FROM = process.env.MAIL_FROM || "onboarding@resend.dev";
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
	path: path.resolve(__dirname, "../.env"),
});

/**
 * Send email verification OTP
 */
const sendVerificationOTP = async (email, otp) => {
	try {
		const { data, error } = await resend.emails.send({
			from: `EaseEvent <${MAIL_FROM}>`,
			to: [email],
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
						Thank you for registering with
						<strong>EaseEvent</strong>.
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

					<hr style="
						border: none;
						border-top: 1px solid #e5e7eb;
					">

					<p style="
						text-align: center;
						color: #6b7280;
						font-size: 12px;
					">
						© EaseEvent
					</p>
				</div>
			`,
		});

		if (error) {
			console.error("Resend error:", error);

			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
			messageId: data?.id,
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
		const { data, error } = await resend.emails.send({
			from: `EaseEvent <${MAIL_FROM}>`,
			to: [email],
			subject: "EaseEvent - Password Reset OTP",
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
						Reset Your Password
					</h2>

					<p>
						Use the OTP below to reset your EaseEvent password.
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
						This OTP is valid for <strong>10 minutes</strong>.
					</p>

					<p>
						If you did not request a password reset,
						you can safely ignore this email.
					</p>
				</div>
			`,
		});

		if (error) {
			console.error("Resend password reset error:", error);

			return {
				success: false,
				error: error.message,
			};
		}

		return {
			success: true,
			messageId: data?.id,
		};
	} catch (error) {
		console.error("Error sending password reset OTP:", error);

		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	sendVerificationOTP,
	sendPasswordResetOTP,
};
