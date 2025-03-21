import { ArrayBase } from "../base.js";

export class DotArray extends ArrayBase {
    private _dotsX: Int16Array;
    private _dotsY: Int16Array;
    private _radiuses: Int16Array;
    private _colors: Array<string>;

    constructor() {
        super();
        this._dotsX = new Int16Array(this.space);
        this._dotsY = new Int16Array(this.space);
        this._radiuses = new Int16Array(this.space);
        this._colors = new Array<string>();
    }

    public get dotsX(): Readonly<Int16Array> {
        return this._dotsX.slice(0, this.length);
    }

    public get dotsY(): Readonly<Int16Array> {
        return this._dotsY.slice(0, this.length);
    }

    public get radiuses(): Readonly<Int16Array> {
        return this._radiuses.slice(0, this.length);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    public push(x: number, y: number, radius: number, color: string): void {
        this.occupyItemSpace();

        this._dotsX[this.count] = x;
        this._dotsY[this.count] = y;
        this._radiuses[this.count] = radius;
        this._colors.push(color);
    }

    protected override expand(): void {
        this.expandDotsX();
        this.expandDotsY();
        this.expandRadiuses();
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

    private expandRadiuses(): void {
        const radiuses = this._radiuses;
        this._radiuses = new Int16Array(this.space);

        for (let index = 0; index < radiuses.length; index++) {
            this._radiuses[index] = radiuses[index];
        }
    }
}