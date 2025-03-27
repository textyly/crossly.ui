export abstract class ArrayBase {
    private readonly default = 10;
    private readonly step = 4;

    protected count: number;
    protected space: number;

    constructor() {
        this.count = -1;
        this.space = this.default;
    }

    public get length(): number {
        return this.count + 1;
    }

    protected occupyItemSpace(): void {
        this.count += 1;
        this.ensureSpace();
    }

    protected removeItemSpace(): boolean {
        if (this.count >= 0) {
            this.count -= 1;
            return true;
        }
        return false;
    }

    protected ensureSpace(): void {
        const free = (this.space - this.count);
        if (free <= 0) {
            this.space = this.space * this.step;
            this.expand();
        }
    }

    protected abstract expand(): void;
}