import type { PageServerLoad } from './$types';
import { getHomeCarousel } from '$lib/server/store';

export const load: PageServerLoad = () => {
	const carousel = getHomeCarousel();
	return {
		carousel: {
			slides: carousel.slides.map((s) => ({
				image: s.image,
				...(s.title ? { title: s.title } : {}),
				...(s.subtitle ? { subtitle: s.subtitle } : {}),
				...(s.href ? { href: s.href } : {})
			})),
			interval_ms: carousel.interval_ms
		}
	};
};
