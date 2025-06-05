import { CrosslyCanvasPatternEx, IRepository, Link, Links } from "./types.js";

// TODO: must be done in a queue so that save and get requests are ordered
// TODO: must save periodically and all middle updates must be filtered out
export class RepositoryThrottler implements IRepository {
    private readonly repository: IRepository;

    constructor(repository: IRepository) {
        this.repository = repository;
    }

    public getAll(): Promise<Links> {
        return this.repository.getAll();
    }

    public getById(path: string): Promise<CrosslyCanvasPatternEx> {
        return this.repository.getById(path);
    }

    public create(pattern: CrosslyCanvasPatternEx): Promise<Link> {
        return this.repository.create(pattern);
    }

    public replace(path: string, pattern: CrosslyCanvasPatternEx): Promise<boolean> {
        return this.repository.replace(path, pattern);
    }

    public rename(path: string, newName: string): Promise<boolean> {
        return this.repository.rename(path, newName);
    }

    public delete(path: string): Promise<boolean> {
        return this.repository.delete(path);
    }
}