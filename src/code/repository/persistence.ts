import assert from "../asserts/assert.js";
import { DataModel, Id, DataModelStream, IPersistence } from "./types.js";

export class Persistence implements IPersistence {
	private readonly endpoint: string;
	private readonly endpointCommonPath: string;

	private readonly createOptions: RequestInit;
	private readonly deleteOptions: RequestInit;
	private readonly renameOptions: RequestInit;
	private readonly replaceOptions: RequestInit;

	constructor() {
		this.endpoint = "http://localhost:5026";
		this.endpointCommonPath = "/api/v1/patterns";

		this.createOptions = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};

		this.deleteOptions = {
			method: "DELETE"
		};

		this.replaceOptions = {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};

		this.renameOptions = {
			method: "PATCH",
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}

	public async getAll(): Promise<Array<Id>> {
		const endpoint = this.getEndpoint();
		const response = await fetch(endpoint);
		const result = await response.json();

		const ids = result.ids as Array<Id>;
		assert.defined(ids, "ids");

		ids.forEach((id) => assert.greaterThanZero(id.length, "id.length"));

		return ids;
	}

	public async getById(id: Id): Promise<DataModelStream> {
		const idEndpoint = this.getIdEndpoint(id);

		const result = await fetch(idEndpoint);
		const dataModel = result.body;

		assert.defined(dataModel, "dataModel");

		return dataModel;
	}

	public async delete(id: string): Promise<boolean> {
		const idEndpoint = this.getIdEndpoint(id);
		const result = await fetch(idEndpoint, this.deleteOptions);

		const success = result.status === 204;
		return success;
	}

	public async create(dataModel: DataModel): Promise<Id> {
		const endpoint = this.getEndpoint();
		const options = { ...this.createOptions, body: dataModel };

		const result = await fetch(endpoint, options);
		const resultData = await result.json();
		const id = resultData.id as string;

		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		return id;
	}

	public async rename(id: string, newName: string): Promise<boolean> {
		const renameEndpoint = this.getRenameEndpoint(id);
		const options = { ...this.renameOptions, body: JSON.stringify({ newName }) };

		const result = await fetch(renameEndpoint, options);
		const success = result.status === 200;

		return success;
	}

	public async replace(id: string, dataModel: DataModel): Promise<boolean> {
		const replaceEndpoint = this.getIdEndpoint(id);
		const options = { ...this.replaceOptions, body: dataModel };

		const result = await fetch(replaceEndpoint, options);
		const success = result.status === 200;

		return success;
	}

	private getRenameEndpoint(id: string): string {
		const idEndpoint = this.getIdEndpoint(id);

		const renameEndpoint = `${idEndpoint}/rename`;
		return renameEndpoint;
	}

	private getIdEndpoint(id: string): string {
		const encodedId = encodeURIComponent(id);
		const endpoint = this.getEndpoint();

		const idEndpoint = `${endpoint}/${encodedId}`;
		return idEndpoint;
	}

	private getEndpoint(): string {
		const endpoint = `${this.endpoint}${this.endpointCommonPath}`;
		return endpoint;
	}
}