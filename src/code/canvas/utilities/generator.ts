export class IdGenerator {
    private readonly initialId: number;
    private nextId: number;

    constructor(initialId?: number) {
        this.initialId = initialId ?? -1;
        this.nextId = this.initialId;
    }

    public next(): number {
        const id = ++this.nextId;
        return id;
    }

    public reset(): void {
        this.nextId = this.initialId;
    }
}