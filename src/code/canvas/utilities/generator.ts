export class IdGenerator {
    private readonly initialId: number;
    private nextId: number;

    constructor() {
        this.initialId = -1;
        this.nextId = this.initialId;
    }

    public next(): number {
        const id = ++this.nextId;
        return id;
    }
}