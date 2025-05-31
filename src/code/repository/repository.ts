import { CrosslyDataModel, IConverter, IValidator } from "../data-model/types.js";
import { ICompressor, Id, IRepository, IPersistence, CrosslyCanvasPatternEx } from "./types.js";

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
        return this.persistence.getAll();
    }

    public async getByName(name: string): Promise<CrosslyCanvasPatternEx> {
        const dataModel = await this.getByNameDataModel(name);

        const pattern = this.converter.convertToCrosslyPattern(dataModel);
        this.validator.validatePattern(pattern);

        const result = { ...pattern, name: dataModel.name };
        return result;
    }

    public async getById(id: Id): Promise<CrosslyCanvasPatternEx> {
        const dataModel = await this.getByIdDataModel(id);

        const pattern = this.converter.convertToCrosslyPattern(dataModel);
        this.validator.validatePattern(pattern);

        const result = { ...pattern, name: dataModel.name };
        return result;
    }

    public delete(id: string): Promise<boolean> {
        return this.persistence.delete(id);
    }

    public rename(id: string, newName: string): Promise<boolean> {
        return this.persistence.rename(id, newName);
    }

    public async save(pattern: CrosslyCanvasPatternEx): Promise<Id> {
        const dataModel = this.converter.convertToDataModel(pattern.name, pattern);
        this.validator.validateDataModel(dataModel);

        const id = await this.saveDataModel(dataModel);
        return id
    }

    public replace(id: string, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        const dataModel = this.converter.convertToDataModel(pattern.name, pattern);
        this.validator.validateDataModel(dataModel);

        return this.replaceDataModel(id, dataModel);
    }

    private async saveDataModel(dataModel: CrosslyDataModel): Promise<Id> {
        const compressedDataModel = await this.compressor.compress(dataModel);
        const id = await this.persistence.save(compressedDataModel);
        return id;
    }

    private async replaceDataModel(id: string, dataModel: CrosslyDataModel): Promise<boolean> {
        const compressedDataModel = await this.compressor.compress(dataModel);
        const success = await this.persistence.replace(id, compressedDataModel);
        return success;
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