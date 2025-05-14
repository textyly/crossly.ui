import { IRepository } from "./types.js";
import { Validator } from "./validator.js";
import { Converter } from "./converter.js";
import { Compressor } from "./compressor.js";
import { Repository } from "./repository.js";
import { Persistence } from "./persistence.js";
import { RepositoryWrapper } from "./wrapper.js";

export class RepositoryFactory {
    public create(): IRepository {
        const validator = new Validator();
        const converter = new Converter();
        const compressor = new Compressor();
        const persistence = new Persistence();

        const repository = new Repository(validator, converter, compressor, persistence);
        const wrapper = new RepositoryWrapper(repository);
        return wrapper;
    };
}