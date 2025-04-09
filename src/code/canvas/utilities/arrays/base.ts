export abstract class ArrayBase {
    private readonly default = 10;
    private readonly step = 4;

    protected index: number;
    protected space: number;

    constructor() {
        this.index = -1;
        this.space = this.default;
    }

    public get length(): number {
        return this.index + 1;
    }

    protected occupyItemSpace(): void {
        this.index += 1;
        this.ensureSpace();
    }

    protected removeItemSpace(): boolean {
        if (this.index < 0) {
            return false;
        } else {
            this.index -= 1;
            return true;
        }
    }

    protected ensureSpace(): void {
        const free = (this.space - this.index);
        if (free === 0) {
            this.space = this.space * this.step;
            this.expand();
        }
    }

    protected abstract expand(): void;
}