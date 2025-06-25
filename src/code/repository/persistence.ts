import assert from "../asserts/assert.js";
import { DataModel, DataModelStream, IPersistence, Link, Links } from "./types.js";

export class Persistence implements IPersistence {
	private readonly baseEndpoint: string;
	private readonly endpoint: string;

	private readonly createOptions: RequestInit;
	private readonly deleteOptions: RequestInit;
	private readonly renameOptions: RequestInit;
	private readonly replaceOptions: RequestInit;

	constructor() {
		this.baseEndpoint = "http://localhost:5026"; // TODO: inject via constructor!!!
		this.endpoint = this.baseEndpoint + "/api/v1/patterns"; // TODO: inject via constructor!!!

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

	public async getAll(): Promise<Links> {
		// get all ids
		const response = await fetch(this.endpoint);
		const result = await response.json();
		const links = result.links as Links;

		// then validate them
		assert.defined(links, "links");
		links.forEach((link) => this.assertLink(link));

		return links;
	}

	public async getById(path: string): Promise<DataModelStream> {
		// validate id first
		assert.greaterThanZero(path?.length, "path.length");

		// then get a data model stream
		const endpoint = this.baseEndpoint + path;
		const response = await fetch(endpoint);
		const dataModelStream = response.body;

		// check whether the dataModelStream is defined, if not throw an error intentionally
		assert.defined(dataModelStream, "dataModel");

		return dataModelStream;
	}

	public async create(dataModel: DataModel): Promise<Link> {
		// validate dataModel first
		assert.defined(dataModel, "dataModel");

		// then create a data model
		const response = await this.createCore(dataModel);
		const data = await response.json();
		const link = data.link as Link;

		// check whether link is defined, if not throw an error intentionally
		this.assertLink(link);

		return link;
	}

	public async replace(path: string, dataModel: DataModel): Promise<boolean> {
		// validate id and dataModel first
		assert.greaterThanZero(path?.length, "path.length");

		assert.defined(dataModel, "dataModel");

		// then replace a data model
		const endpoint = this.baseEndpoint + path;
		const result = await this.replaceCore(endpoint, dataModel);

		// check whether status is successful
		const success = result.status === 200;

		return success;
	}

	public async rename(path: string, newName: string): Promise<boolean> {
		// validate id and newName first
		assert.greaterThanZero(path?.length, "path.length");
		assert.greaterThanZero(newName?.length, "newName.length");

		// then rename a data model
		const endpoint = this.baseEndpoint + path;
		const response = await this.renameCore(endpoint, newName);

		// check whether status is successful
		const success = response.status === 200;

		return success;
	}

	public async delete(path: string): Promise<boolean> {
		// validate id first
		assert.greaterThanZero(path?.length, "path.length");

		// then delete data model
		const endpoint = this.baseEndpoint + path;
		const response = await this.deleteCore(endpoint);

		// check whether status is successful
		const success = response.status === 204;
		return success;
	}

	private async createCore(dataModel: DataModel): Promise<Response> {
		const options = { ...this.createOptions, body: dataModel };
		const response = await fetch(this.endpoint, options);
		return response;
	}

	private async replaceCore(uri: string, dataModel: DataModel): Promise<Response> {
		const options = { ...this.replaceOptions, body: dataModel };
		const response = await fetch(uri, options);
		return response;
	}

	private async renameCore(uri: string, newName: string): Promise<Response> {
		const options = { ...this.renameOptions, body: JSON.stringify({ newName }) };
		const response = await fetch(uri, options);
		return response;
	}

	private async deleteCore(uri: string): Promise<Response> {
		const response = await fetch(uri, this.deleteOptions);
		return response;
	}

	private assertLink(link: Link): void {
		assert.greaterThanZero(link?.getById?.length, "link.getById.length");
		assert.greaterThanZero(link?.replace?.length, "link.replace.length");
		assert.greaterThanZero(link?.rename?.length, "link.rename.length");
		assert.greaterThanZero(link?.delete?.length, "link.delete.length");
	}
}