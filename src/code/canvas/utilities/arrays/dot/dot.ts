import { Dot } from "../../../types.js";

export class DotArray {
    private readonly default = 10;
    private readonly step = 10;

    private _count: number;
    private _space: number;

    private _dotsX: Int16Array;
    private _dotsY: Int16Array;

    // TODO: add radius and color (stitch and cue)

    constructor() {
        this._count = 0;
        this._space = this.default;

        this._dotsX = new Int16Array(this._space);
        this._dotsY = new Int16Array(this._space);
    }

    public get length(): number {
        return this._count;
    }

    public get dotsX(): Readonly<Int16Array> {
        return this._dotsX.slice(0, this._count);
    }

    public get dotsY(): Readonly<Int16Array> {
        return this._dotsY.slice(0, this._count);
    }

    public push(dot: Dot): void {
        this.pushCoordinates(dot.x, dot.y);
    }

    public pushCoordinates(x: number, y: number): void {
        this.ensureSpace();

        this._dotsX[this._count] = x;
        this._dotsY[this._count] = y;
        this._count++;
    }

    private ensureSpace(): void {
        const free = (this._space - this._count);
        if (free <= 0) {
            this.expand();
        }
    }

    private expand(): void {
        this._space = this._space * this.step;
        this.expandDotsX();
        this.expandDotsY();
    }

    private expandDotsX(): void {
        const dotsX = this._dotsX;
        this._dotsX = new Int16Array(this._space);

        for (let index = 0; index < dotsX.length; index++) {
            this._dotsX[index] = dotsX[index];
        }
    }

    private expandDotsY(): void {
        const dotsY = this._dotsY;
        this._dotsY = new Int16Array(this._space);

        for (let index = 0; index < dotsY.length; index++) {
            this._dotsY[index] = dotsY[index];
        }
    }
}