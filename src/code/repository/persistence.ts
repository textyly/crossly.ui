import assert from "../asserts/assert.js";
import { DataModel, DataModelId, DataModelStream, IPersistence } from "./types.js";

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

	public async getAll(): Promise<Array<DataModelId>> {
		// get all ids
		const response = await this.getAllCore();
		const result = await response.json();
		const ids = result.ids as Array<DataModelId>;

		// then validate them
		assert.defined(ids, "ids");

		// it is possible that the return object is not an array, keep in mind such error
		ids.forEach((id) => {
			assert.defined(id, "id");
			assert.greaterThanZero(id.length, "id.length");
		});

		return ids;
	}

	public async getById(id: DataModelId): Promise<DataModelStream> {
		// validate id first
		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		// then get a data model stream
		const response = await this.getByIdCore(id);
		const dataModelStream = response.body;

		// check whether the dataModelStream is defined, if not throw an error intentionally
		assert.defined(dataModelStream, "dataModel");

		return dataModelStream;
	}

	public async create(dataModel: DataModel): Promise<DataModelId> {
		// validate dataModel first
		assert.defined(dataModel, "dataModel");

		// then create a data model
		const response = await this.createCore(dataModel);
		const data = await response.json();
		const id = data.id as string;

		// check whether id is defined, if not throw an error intentionally
		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		return id;
	}

	public async replace(id: DataModelId, dataModel: DataModel): Promise<boolean> {
		// validate id and dataModel first
		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		assert.defined(dataModel, "dataModel");

		// then replace a data model
		const result = await this.replaceCore(id, dataModel);

		// check whether status is successful
		const success = result.status === 200;

		return success;
	}

	public async rename(id: DataModelId, newName: string): Promise<boolean> {
		// validate id and newName first
		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		assert.defined(newName, "newName");
		assert.greaterThanZero(newName.length, "newName.length");

		// then rename a data model
		const response = await this.renameCore(id, newName);

		// check whether status is successful
		const success = response.status === 200;

		return success;
	}

	public async delete(id: DataModelId): Promise<boolean> {
		// validate id first
		assert.defined(id, "id");
		assert.greaterThanZero(id.length, "id.length");

		// then delete data model
		const response = await this.deleteCore(id);

		// check whether status is successful
		const success = response.status === 204;
		return success;
	}

	private async getAllCore(): Promise<Response> {
		const endpoint = this.getEndpoint();
		const response = await fetch(endpoint);
		return response;
	}

	private async getByIdCore(id: DataModelId): Promise<Response> {
		const idEndpoint = this.getIdEndpoint(id);
		const response = await fetch(idEndpoint);
		return response;
	}

	private async createCore(dataModel: DataModel): Promise<Response> {
		const endpoint = this.getEndpoint();
		const options = { ...this.createOptions, body: dataModel };
		const response = await fetch(endpoint, options);
		return response;
	}

	private async replaceCore(id: DataModelId, dataModel: DataModel): Promise<Response> {
		const replaceEndpoint = this.getIdEndpoint(id);
		const options = { ...this.replaceOptions, body: dataModel };
		const response = await fetch(replaceEndpoint, options);
		return response;
	}

	private async renameCore(id: DataModelId, newName: string): Promise<Response> {
		const renameEndpoint = this.getRenameEndpoint(id);
		const options = { ...this.renameOptions, body: JSON.stringify({ newName }) };
		const response = await fetch(renameEndpoint, options);
		return response;
	}

	private async deleteCore(id: DataModelId): Promise<Response> {
		const idEndpoint = this.getIdEndpoint(id);
		const response = await fetch(idEndpoint, this.deleteOptions);
		return response;
	}

	private getRenameEndpoint(id: DataModelId): string {
		const idEndpoint = this.getIdEndpoint(id);

		const renameEndpoint = `${idEndpoint}/rename`;
		return renameEndpoint;
	}

	private getIdEndpoint(id: DataModelId): string {
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