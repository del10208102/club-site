import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';
import { plainTextToArticleHtml } from './plain-html';
import { UPLOAD_DIR } from './upload';

const dataDir = env.DATA_DIR ?? 'data';
const storePath = () => join(dataDir, 'site.json');

/** 文字类（DOCX 等）与画作（主展示为图片） */
export type WorkKind = 'literary' | 'art';

export type CarouselSlide = {
	id: string;
	/** 图片地址：/files/… 或 /images/… */
	image: string;
	title?: string;
	subtitle?: string;
	/** 可选跳转链接 */
	href?: string;
};

export type Announcement = {
	id: number;
	title: string;
	/** 纯文本备份（搜索/兼容） */
	body: string;
	/** 富文本正文 */
	body_html: string;
	created_at: string;
};

export type Work = {
	id: number;
	title: string;
	department: string;
	author: string;
	description: string;
	stored_name: string;
	original_name: string;
	mime: string;
	created_at: string;
	/** DOCX/编辑器正文（HTML） */
	content_html?: string;
	/** 列表摘要 */
	excerpt?: string;
	/** 作品类型：文字类 / 画作 */
	work_kind?: WorkKind;
	/** 上传者登录名（用于管理权限；旧数据无此字段则视为全员可管） */
	owned_by?: string;
};

export type NewsItem = {
	id: number;
	title: string;
	summary: string;
	body: string;
	created_at: string;
	cover_image?: string;
};

/** 访客账号（密码仅存 bcrypt 哈希） */
export type GuestUser = {
	id: number;
	username: string;
	password_hash: string;
	created_at: string;
};

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export type WorkComment = {
	id: number;
	work_id: number;
	user_id: number;
	body: string;
	created_at: string;
	status: CommentStatus;
};

export type WorkLike = {
	work_id: number;
	user_id: number;
	created_at: string;
};

type SiteData = {
	nextId: { announcement: number; work: number; news: number; guest_user: number; comment: number };
	announcements: Announcement[];
	works: Work[];
	news: NewsItem[];
	recruit: { content: string; updated_at: string };
	/** 首页轮播 */
	home_carousel: { slides: CarouselSlide[]; interval_ms: number };
	guest_users: GuestUser[];
	work_comments: WorkComment[];
	work_likes: WorkLike[];
};

const defaultData = (): SiteData => ({
	nextId: { announcement: 1, work: 1, news: 1, guest_user: 1, comment: 1 },
	announcements: [],
	works: [],
	news: [],
	recruit: {
		content:
			'Fantasy动漫社 · 浙江大学\n\n在这里编辑招新说明：时间、地点、报名方式、QQ群等。',
		updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
	},
	home_carousel: { slides: [], interval_ms: 6000 },
	guest_users: [],
	work_comments: [],
	work_likes: []
});

function migrateAnnouncements(raw: unknown[]): Announcement[] {
	return raw.map((item) => {
		const a = item as Partial<Announcement> & { body?: string };
		const body = typeof a.body === 'string' ? a.body : '';
		let body_html = typeof a.body_html === 'string' ? a.body_html : '';
		if (!body_html.trim() && body.trim()) {
			body_html = plainTextToArticleHtml(body);
		}
		if (!body_html.trim()) {
			body_html = '<p></p>';
		}
		return {
			id: a.id ?? 0,
			title: typeof a.title === 'string' ? a.title : '',
			body,
			body_html,
			created_at: typeof a.created_at === 'string' ? a.created_at : ''
		};
	});
}

function migrateWorks(raw: unknown[]): Work[] {
	return raw.map((item) => {
		const w = item as Partial<Work>;
		const work_kind: WorkKind =
			w.work_kind === 'art' ? 'art' : 'literary';
		const owned_by = typeof w.owned_by === 'string' ? w.owned_by : undefined;
		return {
			id: w.id ?? 0,
			title: typeof w.title === 'string' ? w.title : '',
			department: typeof w.department === 'string' ? w.department : '',
			author: typeof w.author === 'string' ? w.author : '',
			description: typeof w.description === 'string' ? w.description : '',
			stored_name: typeof w.stored_name === 'string' ? w.stored_name : '',
			original_name: typeof w.original_name === 'string' ? w.original_name : '',
			mime: typeof w.mime === 'string' ? w.mime : 'application/octet-stream',
			created_at: typeof w.created_at === 'string' ? w.created_at : '',
			work_kind,
			...(owned_by !== undefined && owned_by !== '' ? { owned_by } : {}),
			...(typeof w.content_html === 'string' && w.content_html ? { content_html: w.content_html } : {}),
			...(typeof w.excerpt === 'string' && w.excerpt ? { excerpt: w.excerpt } : {})
		};
	});
}

function normalize(parsed: Partial<SiteData>): SiteData {
	const d = defaultData();
	const rawAnn = Array.isArray(parsed.announcements) ? parsed.announcements : [];
	const announcements = migrateAnnouncements(rawAnn);
	const rawW = Array.isArray(parsed.works) ? parsed.works : [];
	const works = migrateWorks(rawW);
	const news = Array.isArray(parsed.news) ? parsed.news : [];
	const rawGuests = Array.isArray((parsed as Partial<SiteData>).guest_users)
		? ((parsed as Partial<SiteData>).guest_users as unknown[])
		: [];
	const guest_users: GuestUser[] = rawGuests.map((item) => {
		const g = item as Partial<GuestUser>;
		return {
			id: g.id ?? 0,
			username: typeof g.username === 'string' ? g.username : '',
			password_hash: typeof g.password_hash === 'string' ? g.password_hash : '',
			created_at: typeof g.created_at === 'string' ? g.created_at : ''
		};
	});
	const rawComments = Array.isArray((parsed as Partial<SiteData>).work_comments)
		? ((parsed as Partial<SiteData>).work_comments as unknown[])
		: [];
	const work_comments: WorkComment[] = rawComments.map((item) => {
		const c = item as Partial<WorkComment>;
		const st = c.status === 'approved' || c.status === 'rejected' ? c.status : 'pending';
		return {
			id: c.id ?? 0,
			work_id: typeof c.work_id === 'number' ? c.work_id : 0,
			user_id: typeof c.user_id === 'number' ? c.user_id : 0,
			body: typeof c.body === 'string' ? c.body : '',
			created_at: typeof c.created_at === 'string' ? c.created_at : '',
			status: st
		};
	});
	const rawLikes = Array.isArray((parsed as Partial<SiteData>).work_likes)
		? ((parsed as Partial<SiteData>).work_likes as unknown[])
		: [];
	const work_likes: WorkLike[] = rawLikes.map((item) => {
		const l = item as Partial<WorkLike>;
		return {
			work_id: typeof l.work_id === 'number' ? l.work_id : 0,
			user_id: typeof l.user_id === 'number' ? l.user_id : 0,
			created_at: typeof l.created_at === 'string' ? l.created_at : ''
		};
	});

	const maxA = announcements.reduce((m, x) => Math.max(m, x.id), 0);
	const maxW = works.reduce((m, x) => Math.max(m, x.id), 0);
	const maxN = news.reduce((m, x) => Math.max(m, x.id), 0);
	const maxG = guest_users.reduce((m, x) => Math.max(m, x.id), 0);
	const maxC = work_comments.reduce((m, x) => Math.max(m, x.id), 0);
	const nid = parsed.nextId as
		| Partial<{ announcement: number; work: number; news: number; guest_user: number; comment: number }>
		| undefined;
	const nextId = {
		announcement: typeof nid?.announcement === 'number' ? nid.announcement : Math.max(maxA + 1, 1),
		work: typeof nid?.work === 'number' ? nid.work : Math.max(maxW + 1, 1),
		news: typeof nid?.news === 'number' ? nid.news : Math.max(maxN + 1, 1),
		guest_user: typeof nid?.guest_user === 'number' ? nid.guest_user : Math.max(maxG + 1, 1),
		comment: typeof nid?.comment === 'number' ? nid.comment : Math.max(maxC + 1, 1)
	};
	const hc = parsed.home_carousel;
	const slides: CarouselSlide[] = Array.isArray(hc?.slides)
		? (hc!.slides as unknown[]).map((s) => {
				const x = s as Partial<CarouselSlide>;
				return {
					id: typeof x.id === 'string' ? x.id : randomUUID(),
					image: typeof x.image === 'string' ? x.image : '',
					...(typeof x.title === 'string' && x.title ? { title: x.title } : {}),
					...(typeof x.subtitle === 'string' && x.subtitle ? { subtitle: x.subtitle } : {}),
					...(typeof x.href === 'string' && x.href ? { href: x.href } : {})
				};
			})
		: [];
	const interval_ms =
		typeof hc?.interval_ms === 'number' && hc.interval_ms >= 2000 ? hc.interval_ms : 6000;

	return {
		nextId,
		announcements,
		works,
		news,
		recruit: parsed.recruit ?? d.recruit,
		home_carousel: { slides, interval_ms },
		guest_users,
		work_comments,
		work_likes
	};
}

function readRaw(): SiteData {
	if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
	if (!existsSync(storePath())) {
		const d = defaultData();
		writeRaw(d);
		return d;
	}
	try {
		const raw = readFileSync(storePath(), 'utf-8');
		const parsed = JSON.parse(raw) as Partial<SiteData>;
		const n = normalize(parsed);
		const rawWorks = parsed.works;
		const needsWorkMeta =
			!Array.isArray(rawWorks) ||
			rawWorks.some(
				(w: { department?: string; author?: string }) =>
					typeof w.department !== 'string' || typeof w.author !== 'string'
			);
		const rawAnn = parsed.announcements;
		const needsAnnHtml =
			!Array.isArray(rawAnn) ||
			rawAnn.some((a: { body_html?: string; body?: string }) => typeof a.body_html !== 'string');
		const nid = parsed.nextId as { news?: number } | undefined;
		const needsHomeCarousel = !parsed.home_carousel || typeof parsed.home_carousel !== 'object';
		const needsGuestSocial =
			!Array.isArray((parsed as Partial<SiteData>).guest_users) ||
			!Array.isArray((parsed as Partial<SiteData>).work_comments) ||
			!Array.isArray((parsed as Partial<SiteData>).work_likes) ||
			typeof (parsed.nextId as { guest_user?: number })?.guest_user !== 'number' ||
			typeof (parsed.nextId as { comment?: number })?.comment !== 'number';
		const migrated =
			!Array.isArray(parsed.news) ||
			typeof nid?.news !== 'number' ||
			needsWorkMeta ||
			needsAnnHtml ||
			needsHomeCarousel ||
			needsGuestSocial;
		if (migrated) saveStore(n);
		return n;
	} catch {
		return defaultData();
	}
}

function writeRaw(data: SiteData) {
	const tmp = storePath() + '.tmp';
	const json = JSON.stringify(data, null, '\t');
	writeFileSync(tmp, json, 'utf-8');
	renameSync(tmp, storePath());
}

export function saveStore(data: SiteData) {
	writeRaw(data);
}

export function addAnnouncement(title: string, bodyPlain: string, bodyHtml: string): number {
	const d = readRaw();
	const id = d.nextId.announcement++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	d.announcements.unshift({ id, title, body: bodyPlain, body_html: bodyHtml, created_at });
	saveStore(d);
	return id;
}

export function updateAnnouncement(
	id: number,
	patch: Partial<Pick<Announcement, 'title' | 'body' | 'body_html'>>
): boolean {
	const d = readRaw();
	const i = d.announcements.findIndex((a) => a.id === id);
	if (i === -1) return false;
	d.announcements[i] = { ...d.announcements[i], ...patch };
	saveStore(d);
	return true;
}

export function getAnnouncementById(id: number): Announcement | undefined {
	return readRaw().announcements.find((a) => a.id === id);
}

export function listAnnouncements(): Announcement[] {
	return readRaw().announcements;
}

export function addWork(
	title: string,
	department: string,
	author: string,
	description: string,
	stored_name: string,
	original_name: string,
	mime: string,
	opts?: {
		content_html?: string;
		excerpt?: string;
		work_kind?: WorkKind;
		owned_by?: string;
	}
): number {
	const d = readRaw();
	const id = d.nextId.work++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const work_kind: WorkKind = opts?.work_kind === 'art' ? 'art' : 'literary';
	const row: Work = {
		id,
		title,
		department,
		author,
		description,
		stored_name,
		original_name,
		mime,
		created_at,
		work_kind
	};
	if (opts?.content_html) row.content_html = opts.content_html;
	if (opts?.excerpt) row.excerpt = opts.excerpt;
	const ob = opts?.owned_by?.trim();
	if (ob) row.owned_by = ob;
	d.works.unshift(row);
	saveStore(d);
	return id;
}

export function updateWork(
	id: number,
	patch: Partial<Pick<Work, 'content_html' | 'excerpt' | 'title' | 'description' | 'department' | 'author'>>
): boolean {
	const d = readRaw();
	const i = d.works.findIndex((w) => w.id === id);
	if (i === -1) return false;
	d.works[i] = { ...d.works[i], ...patch };
	saveStore(d);
	return true;
}

export function getWorkById(id: number): Work | undefined {
	return readRaw().works.find((w) => w.id === id);
}

export function listWorks(): Work[] {
	return readRaw().works;
}

export function deleteWork(id: number): boolean {
	const d = readRaw();
	const i = d.works.findIndex((w) => w.id === id);
	if (i === -1) return false;
	const w = d.works[i];
	try {
		const p = join(UPLOAD_DIR, w.stored_name);
		if (existsSync(p)) unlinkSync(p);
	} catch {
		/* 仍从库中移除 */
	}
	d.works.splice(i, 1);
	saveStore(d);
	return true;
}

export function getHomeCarousel(): { slides: CarouselSlide[]; interval_ms: number } {
	const h = readRaw().home_carousel;
	return { slides: [...h.slides], interval_ms: h.interval_ms };
}

export function setHomeCarousel(slides: CarouselSlide[], interval_ms: number) {
	const d = readRaw();
	d.home_carousel = {
		slides,
		interval_ms: Number.isFinite(interval_ms) && interval_ms >= 2000 && interval_ms <= 120_000 ? interval_ms : 6000
	};
	saveStore(d);
}

export function getWorkByStoredName(stored_name: string): Work | undefined {
	return readRaw().works.find((w) => w.stored_name === stored_name);
}

export function getRecruit(): { content: string; updated_at: string } {
	return { ...readRaw().recruit };
}

export function setRecruitContent(content: string) {
	const d = readRaw();
	d.recruit = {
		content,
		updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
	};
	saveStore(d);
}

export function listNews(): NewsItem[] {
	return readRaw().news;
}

export function getNewsById(id: number): NewsItem | undefined {
	return readRaw().news.find((n) => n.id === id);
}

export function addNews(title: string, summary: string, body: string, cover_image?: string): number {
	const d = readRaw();
	const nid = d.nextId.news++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const item: NewsItem = {
		id: nid,
		title,
		summary,
		body,
		created_at,
		...(cover_image?.trim() ? { cover_image: cover_image.trim() } : {})
	};
	d.news.unshift(item);
	saveStore(d);
	return nid;
}

export function getGuestById(id: number): GuestUser | undefined {
	return readRaw().guest_users.find((u) => u.id === id);
}

export function getGuestByUsername(username: string): GuestUser | undefined {
	const t = username.trim().toLowerCase();
	return readRaw().guest_users.find((u) => u.username.toLowerCase() === t);
}

export function addGuestUser(username: string, password_hash: string): number {
	const d = readRaw();
	const id = d.nextId.guest_user++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	d.guest_users.push({ id, username: username.trim(), password_hash, created_at });
	saveStore(d);
	return id;
}

export function listApprovedCommentsForWork(workId: number): Array<WorkComment & { username: string }> {
	const d = readRaw();
	const idSet = new Map(d.guest_users.map((u) => [u.id, u.username]));
	return d.work_comments
		.filter((c) => c.work_id === workId && c.status === 'approved')
		.sort((a, b) => a.created_at.localeCompare(b.created_at))
		.map((c) => ({ ...c, username: idSet.get(c.user_id) ?? '访客' }));
}

export function listPendingComments(): WorkComment[] {
	return readRaw().work_comments
		.filter((c) => c.status === 'pending')
		.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function listPendingCommentsForAdmin(): Array<WorkComment & { username: string; work_title: string }> {
	const d = readRaw();
	const map = new Map(d.guest_users.map((u) => [u.id, u.username]));
	return listPendingComments().map((c) => ({
		...c,
		username: map.get(c.user_id) ?? '?',
		work_title: d.works.find((w) => w.id === c.work_id)?.title ?? `#${c.work_id}`
	}));
}

export function getCommentById(id: number): WorkComment | undefined {
	return readRaw().work_comments.find((c) => c.id === id);
}

export function addWorkComment(workId: number, userId: number, body: string): number {
	const d = readRaw();
	const id = d.nextId.comment++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	d.work_comments.push({
		id,
		work_id: workId,
		user_id: userId,
		body,
		created_at,
		status: 'pending'
	});
	saveStore(d);
	return id;
}

export function setCommentStatus(id: number, status: CommentStatus): boolean {
	const d = readRaw();
	const i = d.work_comments.findIndex((c) => c.id === id);
	if (i === -1) return false;
	d.work_comments[i] = { ...d.work_comments[i], status };
	saveStore(d);
	return true;
}

export function getWorkLikeCount(workId: number): number {
	return readRaw().work_likes.filter((l) => l.work_id === workId).length;
}

export function userHasLikedWork(workId: number, userId: number): boolean {
	return readRaw().work_likes.some((l) => l.work_id === workId && l.user_id === userId);
}

export function toggleWorkLike(workId: number, userId: number): { liked: boolean; count: number } {
	const d = readRaw();
	const idx = d.work_likes.findIndex((l) => l.work_id === workId && l.user_id === userId);
	if (idx === -1) {
		const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
		d.work_likes.push({ work_id: workId, user_id: userId, created_at });
		saveStore(d);
		return { liked: true, count: getWorkLikeCount(workId) };
	}
	d.work_likes.splice(idx, 1);
	saveStore(d);
	return { liked: false, count: getWorkLikeCount(workId) };
}
