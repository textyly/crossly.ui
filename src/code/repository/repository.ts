import assert from "../asserts/assert.js";
import { IConverter, IValidator } from "../data-model/types.js";
import { ICompressor, DataModelId, IRepository, IPersistence, CrosslyCanvasPatternEx } from "./types.js";

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

    public async getAll(): Promise<Array<DataModelId>> {
        const all = await this.persistence.getAll();
        return all;
    }

    public async getById(id: DataModelId): Promise<CrosslyCanvasPatternEx> {
        const dataModelStream = await this.persistence.getById(id);

        // it is possible that decompression might throw some kind of error
        const decompressedDataModel = await this.compressor.decompress(dataModelStream);
        this.validator.validateDataModel(decompressedDataModel);

        const name = decompressedDataModel.name;
        assert.defined(name, "name");
        assert.greaterThanZero(name.length, "name.length");

        const pattern = this.converter.convertToCrosslyPattern(decompressedDataModel);
        this.validator.validatePattern(pattern);

        const result = { ...pattern, name };
        return result;
    }

    public async delete(id: DataModelId): Promise<boolean> {
        return await this.persistence.delete(id);
    }

    public async rename(id: DataModelId, newName: string): Promise<boolean> {
        return await this.persistence.rename(id, newName);
    }

    public async create(pattern: CrosslyCanvasPatternEx): Promise<DataModelId> {
        assert.defined(pattern, "pattern");
        assert.defined(pattern.name, "pattern.name");
        assert.greaterThanZero(pattern.name.length, "pattern.name.length");

        this.validator.validatePattern(pattern);

        const dataModel = this.converter.convertToDataModel(pattern.name, pattern);
        this.validator.validateDataModel(dataModel);

        const compressedDataModel = await this.compressor.compress(dataModel);
        const id = await this.persistence.create(compressedDataModel);
        return id;
    }

    public async replace(id: DataModelId, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        assert.defined(pattern, "pattern");
        assert.defined(pattern.name, "pattern.name");
        assert.greaterThanZero(pattern.name.length, "pattern.name.length");

        this.validator.validatePattern(pattern);

        const dataModel = this.converter.convertToDataModel(pattern.name, pattern);
        this.validator.validateDataModel(dataModel);

        const compressedDataModel = await this.compressor.compress(dataModel);
        const success = await this.persistence.replace(id, compressedDataModel);
        return success;
    }
}