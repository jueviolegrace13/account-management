import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface InvitationEmailData {
	workspaceName: string;
	inviterEmail: string;
	role: 'owner' | 'assistant';
	invitationLink: string;
}

const getInvitationEmailHtml = (data: InvitationEmailData) => `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Workspace Invitation</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
			line-height: 1.6;
			color: #333;
			margin: 0;
			padding: 0;
		}
		.container {
			max-width: 600px;
			margin: 0 auto;
			padding: 20px;
		}
		.header {
			text-align: center;
			padding: 20px 0;
		}
		.content {
			background-color: #ffffff;
			padding: 30px;
			border-radius: 8px;
			box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		}
		.button {
			display: inline-block;
			padding: 12px 24px;
			background-color: #4f46e5;
			color: #ffffff;
			text-decoration: none;
			border-radius: 6px;
			margin: 20px 0;
		}
		.footer {
			text-align: center;
			padding: 20px 0;
			color: #666;
			font-size: 14px;
		}
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Workspace Invitation</h1>
		</div>
		<div class="content">
			<p>Hello,</p>
			<p>${data.inviterEmail} has invited you to join their workspace "${data.workspaceName}" as a ${data.role}.</p>
			<p>Click the button below to accept the invitation and join the workspace:</p>
			<div style="text-align: center;">
				<a href="${data.invitationLink}" class="button">Accept Invitation</a>
			</div>
			<p>If you don't have an account yet, you'll be able to create one after clicking the button.</p>
			<p>If you believe this invitation was sent by mistake, you can safely ignore this email.</p>
		</div>
		<div class="footer">
			<p>This invitation will expire in 7 days.</p>
		</div>
	</div>
</body>
</html>
`;

export const sendWorkspaceInvitation = async (
	toEmail: string,
	data: InvitationEmailData
) => {
	try {
		const { data: response, error } = await supabase.functions.invoke('send-email', {
			body: {
				to: toEmail,
				subject: `You've been invited to join ${data.workspaceName}`,
				html: getInvitationEmailHtml(data),
				data: {
					workspaceName: data.workspaceName,
					inviterEmail: data.inviterEmail,
					role: data.role,
					invitationLink: data.invitationLink,
				},
			},
		});

		if (error) {
			throw new Error(error.message);
		}

		if (!response.success) {
			throw new Error(response.error || 'Failed to send invitation email');
		}

		return response;
	} catch (error) {
		console.error('Error sending invitation email:', error);
		throw error;
	}
}; 