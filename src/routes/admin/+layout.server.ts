import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	if (!locals.admin) {
		redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}
	return { adminUser: locals.adminUser ?? '' };
};
