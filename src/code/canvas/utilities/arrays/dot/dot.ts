import { Dot } from "../../../types.js";

export class DotArray {
    private readonly default = 10;
    private readonly step = 4;

    private _count: number;
    private _space: number;

    private _dotsX: Int16Array;
    private _dotsY: Int16Array;
    private _radiuses: Float32Array;
    private _colors: Array<string>;

    constructor() {
        this._count = 0;
        this._space = this.default;

        this._dotsX = new Int16Array(this._space);
        this._dotsY = new Int16Array(this._space);
        this._radiuses = new Float32Array(this._space);
        this._colors = new Array<string>();
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

    public get radiuses(): Readonly<Float32Array> {
        return this._radiuses.slice(0, this._count);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    public push(x: number, y: number, radius: number, color: string): void {
        this.ensureSpace();

        this._dotsX[this._count] = x;
        this._dotsY[this._count] = y;
        this._radiuses[this._count] = radius;
        this._colors.push(color);
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
        this.expandRadiuses();
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

    private expandRadiuses(): void {
        const radiuses = this._radiuses;
        this._radiuses = new Float32Array(this._space);

        for (let index = 0; index < radiuses.length; index++) {
            this._radiuses[index] = radiuses[index];
        }
    }
}