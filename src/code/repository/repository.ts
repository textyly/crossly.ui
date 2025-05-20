import { CrosslyCanvasPattern } from "../canvas/types.js";
import { ICompressor, Id, IRepository, IPersistence } from "./types.js";
import { CrosslyDataModel, IConverter, IValidator } from "../data-model/types.js";

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

    public async save(pattern: CrosslyCanvasPattern): Promise<Id> {
        const dataModel = this.converter.convertToDataModel(pattern);
        this.validator.validateDataModel(dataModel);

        const id = await this.saveDataModel(dataModel);
        return id
    }

    public async get(id: Id): Promise<CrosslyCanvasPattern> {
        const dataModel = await this.getDataModel(id);

        const pattern = this.converter.convertToCrosslyPattern(dataModel);
        this.validator.validatePattern(pattern);

        return pattern;
    }

    private async saveDataModel(dataModel: CrosslyDataModel): Promise<Id> {
        const compressedDataModel = await this.compressor.compress(dataModel);
        const id = await this.persistence.save(compressedDataModel);
        return id;
    }

    private async getDataModel(id: Id): Promise<CrosslyDataModel> {
        const dataModelStream = await this.persistence.get(id);
        const decompressedDataModel = await this.compressor.decompress(dataModelStream);
        return decompressedDataModel;
    }
}