import assert from "../asserts/assert.js";
import { IDisposable, VoidUnsubscribe } from "../types.js";

export abstract class Base implements IDisposable {
    private readonly className: string;
    private readonly uns: Array<VoidUnsubscribe>;
    protected disposed: boolean;

    constructor(className: string) {
        this.className = className;
        this.uns = new Array<VoidUnsubscribe>;
        this.disposed = false;
    }

    public dispose(): void {
        this.ensureAlive();
        this.uns.forEach((un) => un());
        this.disposed = true;
    }

    protected registerUn(func: VoidUnsubscribe): void {
        this.ensureAlive();
        this.uns.push(func);
    }

    protected ensureAlive(): void {
        assert.alive(this.disposed, this.className);
    }
}