import assert from "../asserts/assert.js";
import { DataModel, Id, DataModelStream, IPersistence } from "./types.js";

export class Persistence implements IPersistence {
	private readonly endPointRoot: string;
	private readonly getByIdEndPoint: string;
	private readonly getByNameEndPoint: string;

	private readonly saveEndPoint: string;
	private readonly saveOptions: RequestInit;


	constructor() {
		this.endPointRoot = "http://localhost:5026";
		this.getByIdEndPoint = this.endPointRoot + "/get/by-id?id=";
		this.getByNameEndPoint = this.endPointRoot + "/get/by-name?name=";

		this.saveEndPoint = this.endPointRoot + "/save";
		this.saveOptions = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};
	}
	public async getAll(): Promise<Array<Id>> {
		throw new Error("Method not implemented.");
	}

	public async getByName(name: string): Promise<DataModelStream> {
		return this.getBy(this.getByNameEndPoint, name);
	}

	public async getById(id: Id): Promise<DataModelStream> {
		return this.getBy(this.getByIdEndPoint, id);
	}

	public async delete(id: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	public async save(dataModel: DataModel): Promise<Id> {
		const body = dataModel;
		const options = { ...this.saveOptions, body };
		const result = await fetch(this.saveEndPoint, options);

		const resultData = await result.json();
		const id = resultData.id as string;

		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		return id;
	}

	public async rename(oldName: string, newName: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	public async replace(id: string, dataModel: DataModel): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	private async getBy(getByEndpoint: string, value: string): Promise<DataModelStream> {
		const encodedId = encodeURIComponent(value);

		const endpoint = getByEndpoint + encodedId;
		const response = await fetch(endpoint);
		const dataModel = response.body;

		assert.defined(dataModel, "dataModel");

		return dataModel;
	}
}