import { Id, IRepository } from "./types.js";
import { CrosslyCanvasPattern } from "../canvas/types.js";

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

    public getByName(name: string): Promise<CrosslyCanvasPattern> {
        return this.repository.getByName(name);
    }

    public getById(id: Id): Promise<CrosslyCanvasPattern> {
        return this.repository.getById(id);
    }

    public delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    public rename(oldName: string, newName: string): Promise<boolean> {
        return this.repository.rename(oldName, newName);
    }

    public save(name: string, canvasData: CrosslyCanvasPattern): Promise<Id> {
        return this.repository.save(name, canvasData);
    }

    public replace(id: string, pattern: CrosslyCanvasPattern): Promise<boolean> {
        return this.repository.replace(id, pattern);
    }
}