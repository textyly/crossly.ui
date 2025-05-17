import { CrosslyCanvasPattern } from "../canvas/types.js";
import { CrosslyDataModel } from "../data-model/types.js";
import { ICompressor, IValidator, Id, IRepository, IConverter, IPersistence } from "./types.js";

export class Repository implements IRepository {
    private readonly validator: IValidator;
    private readonly converter: IConverter;
    private readonly compressor: ICompressor;
    private readonly persistence: IPersistence;

    constructor(
        validator: IValidator,
        converter: IConverter,
        compressor: ICompressor,
        persistence: IPersistence,
    ) {
        this.validator = validator;
        this.converter = converter;
        this.compressor = compressor;
        this.persistence = persistence;
    }

    public async save(canvasData: CrosslyCanvasPattern): Promise<Id> {
        const dataModel = this.converter.convertToDataModel(canvasData);
        this.validator.validateDataModel(dataModel);
        const id = await this.saveDataModel(dataModel);
        return id
    }

    public async get(id: Id): Promise<CrosslyCanvasPattern> {
        const dataModel = await this.getDataModel(id);
        const canvasData = this.converter.convertToCanvasData(dataModel);
        this.validator.validateCanvasData(canvasData);
        return canvasData;
    }

    private async saveDataModel(dataModel: CrosslyDataModel): Promise<Id> {
        const compressedDataModel = await this.compressor.compress(dataModel);
        const id = await this.persistence.save(compressedDataModel);
        return id;
    }

    private async getDataModel(id: Id): Promise<CrosslyDataModel> {
        const dataModelStream = await this.persistence.get(id);
        if (!dataModelStream) {
            throw new Error(`data model with id: ${id} cannot be found.`);
        }

        const decompressedDataModel = await this.compressor.decompress(dataModelStream);
        return decompressedDataModel;
    }
}