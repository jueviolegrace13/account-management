import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';
import { load } from 'https://deno.land/std@0.168.0/dotenv/mod.ts';

const env = await load();

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', {
			headers: corsHeaders,
			status: 200
		});
	}

	try {
		// Only allow POST requests
		if (req.method !== 'POST') {
			throw new Error('Method not allowed');
		}

		const { to, subject, template, data } = await req.json();

		// Validate required fields
		if (!to || !subject || !template) {
			throw new Error('Missing required fields: to, subject, and template are required');
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(to)) {
			throw new Error('Invalid email format');
		}

		// Load email template
		const templatePath = new URL(`../email-templates/${template}.html`, import.meta.url);
		let templateContent;
		try {
			templateContent = await Deno.readTextFile(templatePath);
		} catch (error) {
			throw new Error(`Template not found: ${template}`);
		}

		// Replace template variables
		if (data) {
			Object.entries(data).forEach(([key, value]) => {
				templateContent = templateContent.replace(
					new RegExp(`{{${key}}}`, 'g'),
					String(value)
				);
			});
		}

		// Configure SMTP client
		const client = new SmtpClient();

		try {
			await client.connectTLS({
				hostname: env['SMTP_HOSTNAME'],
				port: parseInt(env['SMTP_PORT']),
				username: env['SMTP_USERNAME'],
				password: env['SMTP_PASSWORD'],
			});

			// Send email
			await client.send({
				from: env['SMTP_FROM_EMAIL'],
				to,
				subject,
				content: templateContent,
				html: templateContent,
			});

			await client.close();

			return new Response(
				JSON.stringify({
					success: true,
					message: 'Email sent successfully'
				}),
				{
					headers: {
						...corsHeaders,
						'Content-Type': 'application/json',
					},
					status: 200
				}
			);
		} catch (error) {
			await client.close();
			throw new Error(`Failed to send email: ${error.message}`);
		}
	} catch (error) {
		console.error('Error:', error.message);

		return new Response(
			JSON.stringify({
				success: false,
				error: error.message
			}),
			{
				status: error.message.includes('Method not allowed') ? 405 : 400,
				headers: {
					...corsHeaders,
					'Content-Type': 'application/json',
				},
			}
		);
	}
});
