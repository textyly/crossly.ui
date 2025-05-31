import { CrosslyCanvasPatternEx, Id, IRepository } from "./types.js";

// TODO: must be done in a queue so that save and get requests are ordered
// TODO: must save periodically and all middle updates must be filtered out
export class RepositoryThrottler implements IRepository {
    private readonly repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    public getAll(): Promise<Array<Id>> {
        return this.repository.getAll();
    }

    public getById(id: Id): Promise<CrosslyCanvasPatternEx> {
        return this.repository.getById(id);
    }

    public delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    public rename(id: string, newName: string): Promise<boolean> {
        return this.repository.rename(id, newName);
    }

    public create(canvasData: CrosslyCanvasPatternEx): Promise<Id> {
        return this.repository.create(canvasData);
    }

    public replace(id: string, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        return this.repository.replace(id, pattern);
    }
}