import { DataModel, Id, DataModelStream, IPersistence } from "./types.js";

export class Persistence implements IPersistence {
	private readonly endPointRoot: string;
	private readonly getEndPoint: string;

	private readonly saveEndPoint: string;
	private readonly saveOptions: RequestInit;


	constructor() {
		this.endPointRoot = "http://localhost:5026";
		this.getEndPoint = this.endPointRoot + "/get?id=";

		this.saveEndPoint = this.endPointRoot + "/save";
		this.saveOptions = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json',
				'Content-Encoding': 'gzip'
			}
		};
	}

	public async get(id: Id): Promise<DataModelStream | null> {
		const encodedId = encodeURIComponent(id);
		const getEndPoint = this.getEndPoint + encodedId;
		const response = await fetch(getEndPoint);
		const dataModel = response.body;
		return dataModel;
	}

	public async save(dataModel: DataModel): Promise<Id> {
		const body = dataModel;
		const options = { ...this.saveOptions, body };
		const result = await fetch(this.saveEndPoint, options);
		const resultData = await result.json();
		const id = resultData.id;
		return id;
	}
}