import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		persistSession: true,
		storageKey: 'accounthub-auth',
		storage: {
			getItem: (key) => {
				const value = localStorage.getItem(key);
				return value ? JSON.parse(value) : null;
			},
			setItem: (key, value) => {
				localStorage.setItem(key, JSON.stringify(value));
			},
			removeItem: (key) => {
				localStorage.removeItem(key);
			},
		},
	},
});