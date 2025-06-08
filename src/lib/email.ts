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
	const { error } = await supabase.functions.invoke('send-email', {
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

	if (error) throw error;
}; 