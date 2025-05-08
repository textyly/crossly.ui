import { IRepositoryClient } from "./types.js";

export class RepositoryClient implements IRepositoryClient {

	public async save(data: Uint8Array): Promise<string> {
		const result = await fetch('http://localhost:5026/save', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			},
			body: data
		});

		const resultData = await result.json();
		return resultData.id;
	}

	public async get(id: string): Promise<ReadableStream<Uint8Array> | null> {
		const response = await fetch(`http://localhost:5026/get?id=${encodeURIComponent(id)}`);

		const dataModel = response.body;
		return dataModel;
	}
}