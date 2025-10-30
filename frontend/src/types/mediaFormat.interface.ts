export interface IMediaFormat {
	id: number;
	documentId: string;
	name: string;
	alternativeText: string;
	caption: string;
	width: number;
	height: number;
	formats: {thumbnail: typeThumbnail};
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string;
	provider: string;
	provider_metadata: string;
	blurHash: string;
}

type typeThumbnail = {
	hash: string;
	height: number;
	name: string;
	url: "/uploads/thumbnail_estate1_3d1dbc146f.jpg";
	width: number;
};
