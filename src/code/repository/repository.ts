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

    public getAll(): Promise<Array<Id>> {
        // TODO: validate
        return this.persistence.getAll();
    }

    public async getByName(name: string): Promise<CrosslyCanvasPattern> {
        const dataModel = await this.getByNameDataModel(name);

        const pattern = this.converter.convertToCrosslyPattern(dataModel);
        this.validator.validatePattern(pattern);

        return pattern;
    }

    public async getById(id: Id): Promise<CrosslyCanvasPattern> {
        const dataModel = await this.getByIdDataModel(id);

        const pattern = this.converter.convertToCrosslyPattern(dataModel);
        this.validator.validatePattern(pattern);

        return pattern;
    }

    public delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public rename(oldName: string, newName: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    public async save(name: string, pattern: CrosslyCanvasPattern): Promise<Id> {
        const dataModel = this.converter.convertToDataModel(name, pattern);
        this.validator.validateDataModel(dataModel);

        const id = await this.saveDataModel(dataModel);
        return id
    }

    public replace(id: string, pattern: CrosslyCanvasPattern): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

    private async saveDataModel(dataModel: CrosslyDataModel): Promise<Id> {
        const compressedDataModel = await this.compressor.compress(dataModel);
        const id = await this.persistence.save(compressedDataModel);
        return id;
    }

    private async getByIdDataModel(id: Id): Promise<CrosslyDataModel> {
        const dataModelStream = await this.persistence.getById(id);
        const decompressedDataModel = await this.compressor.decompress(dataModelStream);
        return decompressedDataModel;
    }

    private async getByNameDataModel(name: string): Promise<CrosslyDataModel> {
        const dataModelStream = await this.persistence.getByName(name);
        const decompressedDataModel = await this.compressor.decompress(dataModelStream);
        return decompressedDataModel;
    }
}