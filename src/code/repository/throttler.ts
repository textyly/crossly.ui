import { CrosslyCanvasPatternEx, DataModelId, IRepository } from "./types.js";

// TODO: must be done in a queue so that save and get requests are ordered
// TODO: must save periodically and all middle updates must be filtered out
export class RepositoryThrottler implements IRepository {
    private readonly repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    public getAll(): Promise<Array<DataModelId>> {
        return this.repository.getAll();
    }

    public getById(id: DataModelId): Promise<CrosslyCanvasPatternEx> {
        return this.repository.getById(id);
    }

    public create(canvasData: CrosslyCanvasPatternEx): Promise<DataModelId> {
        return this.repository.create(canvasData);
    }

    public replace(id: string, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        return this.repository.replace(id, pattern);
    }

    public rename(id: string, newName: string): Promise<boolean> {
        return this.repository.rename(id, newName);
    }

    public delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}