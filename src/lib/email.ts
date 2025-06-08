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

export const sendWorkspaceInvitation = async (
	toEmail: string,
	data: InvitationEmailData
) => {
	try {
		const { data: response, error } = await supabase.functions.invoke('send-email', {
			body: {
				to: toEmail,
				subject: `You've been invited to join ${data.workspaceName}`,
				template: 'workspace-invitation',
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