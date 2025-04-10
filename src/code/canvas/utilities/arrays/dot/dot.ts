import { ArrayBase } from "../base.js";

export class DotArray extends ArrayBase {
    private readonly _color: string;
    private readonly _radius: number;

    private _dotsX: Int16Array;
    private _dotsY: Int16Array;

    constructor(color: string, radius: number) {
        super();

        this._color = color;
        this._radius = radius;

        this._dotsX = new Int16Array(this.space);
        this._dotsY = new Int16Array(this.space);
    }

    public get color(): string {
        return this._color;
    }

    public get radius(): number {
        return this._radius;
    }

    public get dotsX(): Readonly<Int16Array> {
        return this._dotsX.slice(0, this.length);
    }

    public get dotsY(): Readonly<Int16Array> {
        return this._dotsY.slice(0, this.length);
    }

    public push(x: number, y: number): void {
        this.occupyItemSpace();

        this._dotsX[this.index] = x;
        this._dotsY[this.index] = y;
    }

    protected override expand(): void {
        this.expandDotsX();
        this.expandDotsY();
    }

    private expandDotsX(): void {
        const dotsX = this._dotsX;
        this._dotsX = new Int16Array(this.space);

        for (let index = 0; index < dotsX.length; index++) {
            this._dotsX[index] = dotsX[index];
        }
    }

    private expandDotsY(): void {
        const dotsY = this._dotsY;
        this._dotsY = new Int16Array(this.space);

        for (let index = 0; index < dotsY.length; index++) {
            this._dotsY[index] = dotsY[index];
        }
    }
}