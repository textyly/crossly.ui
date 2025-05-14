import { Compressor } from "./compressor.js";
import { Converter } from "./converter.js";
import { Persistence } from "./persistence.js";
import { Repository } from "./repository.js";
import { IRepository } from "./types.js";
import { Validator } from "./validator.js";

export class RepositoryFactory {
    public create(): IRepository {
        const validator = new Validator();
        const converter = new Converter();
        const compressor = new Compressor();
        const persistence = new Persistence();

        const repository = new Repository(validator, converter, compressor, persistence);
        return repository;
    };
}