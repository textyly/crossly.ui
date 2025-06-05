import assert from "../asserts/assert.js";
import { IConverter, IValidator } from "../data-model/types.js";
import { ICompressor, IRepository, IPersistence, CrosslyCanvasPatternEx, Links, Link } from "./types.js";

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

    public async getAll(): Promise<Links> {
        const all = await this.persistence.getAll();
        return all;
    }

    public async getById(path: string): Promise<CrosslyCanvasPatternEx> {
        const dataModelStream = await this.persistence.getById(path);

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

    public async create(pattern: CrosslyCanvasPatternEx): Promise<Link> {
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

    public async replace(path: string, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        assert.defined(pattern, "pattern");
        assert.defined(pattern.name, "pattern.name");
        assert.greaterThanZero(pattern.name.length, "pattern.name.length");

        this.validator.validatePattern(pattern);

        const dataModel = this.converter.convertToDataModel(pattern.name, pattern);
        this.validator.validateDataModel(dataModel);

        const compressedDataModel = await this.compressor.compress(dataModel);
        const success = await this.persistence.replace(path, compressedDataModel);
        return success;
    }

    public async rename(path: string, newName: string): Promise<boolean> {
        return await this.persistence.rename(path, newName);
    }

    public async delete(path: string): Promise<boolean> {
        return await this.persistence.delete(path);
    }
}