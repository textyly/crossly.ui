import { Id, IRepository } from "./types.js";
import { CrosslyCanvasData } from "../canvas/types.js";

export class RepositoryWrapper implements IRepository {
    private readonly repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    public save(canvasData: CrosslyCanvasData): Promise<Id> {
        // TODO: must be done in a queue so that save and get requests are ordered
        // TODO: must save periodically and all middle updates must be filtered out

        return this.repository.save(canvasData);
    }

    public get(id: Id): Promise<CrosslyCanvasData> {
        return this.repository.get(id);
    }
}