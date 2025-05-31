import assert from "../asserts/assert.js";
import { DataModel, Id, DataModelStream, IPersistence } from "./types.js";

export class Persistence implements IPersistence {
	private readonly endpointRoot: string;

	private readonly getAllEndpoint: string;
	private readonly getByIdEndpoint: string;
	private readonly getByNameEndpoint: string;

	private readonly saveEndpoint: string;
	private readonly saveOptions: RequestInit;

	private readonly replaceEndpoint: string;
	private readonly replaceOptions: RequestInit;

	private readonly renameEndpoint: string;
	private readonly renameOptions: RequestInit;

	constructor() {
		this.endpointRoot = "http://localhost:5026";

		this.getAllEndpoint = `${this.endpointRoot}/get/all`;
		this.getByIdEndpoint = `${this.endpointRoot}/get/by-id`;
		this.getByNameEndpoint = `${this.endpointRoot}/get/by-name`;

		this.saveEndpoint = `${this.endpointRoot}/save`;
		this.saveOptions = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};

		this.replaceEndpoint = `${this.endpointRoot}/replace`;
		this.replaceOptions = {
			method: "PUT",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};

		this.renameEndpoint = `${this.endpointRoot}/rename`;
		this.renameOptions = {
			method: "PATCH"
		};
	}

	public async getAll(): Promise<Array<Id>> {
		const response = await fetch(this.getAllEndpoint);
		const result = await response.json();

		const ids = result.ids as Array<Id>;
		assert.defined(ids, "ids");

		ids.forEach((id) => assert.greaterThanZero(id.length, "id.length"));

		return ids;
	}

	public async getByName(name: string): Promise<DataModelStream> {
		const endpoint = `${this.getByNameEndpoint}?name=`;
		return this.getBy(endpoint, name);
	}

	public async getById(id: Id): Promise<DataModelStream> {
		const endpoint = `${this.getByIdEndpoint}?id=`;
		return this.getBy(endpoint, id);
	}

	public async delete(id: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	public async save(dataModel: DataModel): Promise<Id> {
		const body = dataModel;
		const options = { ...this.saveOptions, body };
		const result = await fetch(this.saveEndpoint, options);

		const resultData = await result.json();
		const id = resultData.id as string;

		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		return id;
	}

	public async rename(id: string, newName: string): Promise<boolean> {
		const encodedId = encodeURIComponent(id);
		const encodedNewName = encodeURIComponent(newName);

		const endpoint = `${this.renameEndpoint}?id = ${encodedId}& newName=${encodedNewName} `;
		const result = await fetch(endpoint, this.renameOptions);

		const resultData = await result.json();
		const success = resultData.success as boolean;

		assert.defined(success, "success");

		return success;
	}

	public async replace(id: string, dataModel: DataModel): Promise<boolean> {
		const body = dataModel;
		const options = { ...this.replaceOptions, body };

		const encodedId = encodeURIComponent(id);
		const endpoint = `${this.replaceEndpoint}?id=${encodedId}`;
		const result = await fetch(endpoint, options);

		const resultData = await result.json();
		const success = resultData.success as boolean;

		assert.defined(success, "success");

		return success;
	}

	private async getBy(getByEndpoint: string, field: string): Promise<DataModelStream> {
		const encodedField = encodeURIComponent(field);

		const endpoint = `${getByEndpoint}${encodedField}`;
		const response = await fetch(endpoint);
		const dataModel = response.body;

		assert.defined(dataModel, "dataModel");

		return dataModel;
	}
}