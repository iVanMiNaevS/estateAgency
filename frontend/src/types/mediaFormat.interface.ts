export interface IMediaFormat {
	id: number;
	documentId: string;
	name: string;
	alternativeText: string;
	caption: string;
	width: number;
	height: number;
	formats: string;
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
