import { Id, IRepository } from "./types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

// TODO: must be done in a queue so that save and get requests are ordered
// TODO: must save periodically and all middle updates must be filtered out
export class RepositoryThrottler implements IRepository {
    private readonly repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    public save(canvasData: CrosslyCanvasPattern): Promise<Id> {
        return this.repository.save(canvasData);
    }

    public get(id: Id): Promise<CrosslyCanvasPattern> {
        return this.repository.get(id);
    }
}