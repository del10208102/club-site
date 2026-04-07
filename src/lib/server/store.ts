import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '$env/dynamic/private';

const dataDir = env.DATA_DIR ?? 'data';
const storePath = () => join(dataDir, 'site.json');

export type Announcement = {
	id: number;
	title: string;
	body: string;
	created_at: string;
};

export type Work = {
	id: number;
	title: string;
	description: string;
	stored_name: string;
	original_name: string;
	mime: string;
	created_at: string;
};

type SiteData = {
	nextId: { announcement: number; work: number };
	announcements: Announcement[];
	works: Work[];
	recruit: { content: string; updated_at: string };
};

const defaultData = (): SiteData => ({
	nextId: { announcement: 1, work: 1 },
	announcements: [],
	works: [],
	recruit: {
		content:
			'在这里编辑招新说明：时间、地点、报名方式、QQ群等。管理员可通过「招新」页更新。',
		updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
	}
});

function readRaw(): SiteData {
	if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
	if (!existsSync(storePath())) {
		const d = defaultData();
		writeRaw(d);
		return d;
	}
	try {
		const raw = readFileSync(storePath(), 'utf-8');
		const parsed = JSON.parse(raw) as SiteData;
		if (!parsed.recruit) parsed.recruit = defaultData().recruit;
		if (!parsed.nextId) parsed.nextId = { announcement: 1, work: 1 };
		return parsed;
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

export function getStore(): SiteData {
	return readRaw();
}

export function saveStore(data: SiteData) {
	writeRaw(data);
}

export function addAnnouncement(title: string, body: string): number {
	const d = readRaw();
	const id = d.nextId.announcement++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	d.announcements.unshift({ id, title, body, created_at });
	saveStore(d);
	return id;
}

export function listAnnouncements(): Announcement[] {
	return readRaw().announcements;
}

export function addWork(
	title: string,
	description: string,
	stored_name: string,
	original_name: string,
	mime: string
): number {
	const d = readRaw();
	const id = d.nextId.work++;
	const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
	d.works.unshift({ id, title, description, stored_name, original_name, mime, created_at });
	saveStore(d);
	return id;
}

export function listWorks(): Work[] {
	return readRaw().works;
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
