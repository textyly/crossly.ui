export class FabricThreadArray {
    private readonly default = 10;
    private readonly step = 4;

    protected _count: number;
    protected _space: number;

    private _visibility: Array<boolean>;
    private _fromDotsXPos: Int32Array;
    private _fromDotsYPos: Int32Array;
    private _toDotsXPos: Int32Array;
    private _toDotsYPos: Int32Array;
    private _widths: Float32Array;
    private _colors: Array<string>;

    constructor() {
        this._count = -1;
        this._space = this.default;

        this._visibility = new Array<boolean>();
        this._fromDotsXPos = new Int32Array(this._space);
        this._fromDotsYPos = new Int32Array(this._space);
        this._toDotsXPos = new Int32Array(this._space);
        this._toDotsYPos = new Int32Array(this._space);
        this._widths = new Float32Array(this._space);
        this._colors = new Array<string>();
    }

    public get length(): number {
        return this._count + 1;
    }

    public get visibility(): Readonly<Array<boolean>> {
        return this._visibility;
    }

    // TODO: change to indexed prop
    public setVisibility(index: number, visibility: boolean): void {
        this._visibility[index] = visibility;
    }

    public get fromDotsXPos(): Readonly<Int32Array> {
        return this._fromDotsXPos.slice(0, this.length);
    }

    public get fromDotsYPos(): Readonly<Int32Array> {
        return this._fromDotsYPos.slice(0, this.length);
    }

    public get toDotsXPos(): Readonly<Int32Array> {
        return this._toDotsXPos.slice(0, this.length);
    }

    public get toDotsYPos(): Readonly<Int32Array> {
        return this._toDotsYPos.slice(0, this.length);
    }

    public get widths(): Readonly<Float32Array> {
        return this._widths.slice(0, this.length);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    // TODO: change to indexed prop
    public set(
        index: number,
        visible: boolean,
        fromDotXPos: number,
        fromDotYPos: number,
        toDotXPos: number,
        toDotYPos: number,
        width: number,
        color: string): void {

        this._visibility[index] = visible;
        this._fromDotsXPos[index] = fromDotXPos;
        this._fromDotsYPos[index] = fromDotYPos;
        this._toDotsXPos[index] = toDotXPos;
        this._toDotsYPos[index] = toDotYPos;
        this._widths[index] = width;
        this._colors[index] = color;
    }

    public push(
        visible: boolean,
        fromDotXPos: number,
        fromDotYPos: number,
        toDotXPos: number,
        toDotYPos: number,
        width: number,
        color: string): void {

        this._count++;

        this.ensureSpace();

        this._visibility.push(visible);
        this._fromDotsXPos[this._count] = fromDotXPos;
        this._fromDotsYPos[this._count] = fromDotYPos;
        this._toDotsXPos[this._count] = toDotXPos;
        this._toDotsYPos[this._count] = toDotYPos;
        this._widths[this._count] = width;
        this._colors.push(color);
    }

    protected ensureSpace(): void {
        const free = (this._space - this._count);
        if (free <= 0) {
            this.expand();
        }
    }

    protected expand(): void {
        this._space = this._space * this.step;
        this.expandFromDotsXPos();
        this.expandFromDotsYPos();
        this.expandToDotsXPos();
        this.expandToDotsYPos();
        this.expandWidths();
    }

    private expandFromDotsXPos(): void {
        const fromDotsXPos = this._fromDotsXPos;
        this._fromDotsXPos = new Int32Array(this._space);

        for (let index = 0; index < fromDotsXPos.length; index++) {
            this._fromDotsXPos[index] = fromDotsXPos[index];
        }
    }

    private expandFromDotsYPos(): void {
        const fromDotsYPos = this._fromDotsYPos;
        this._fromDotsYPos = new Int32Array(this._space);

        for (let index = 0; index < fromDotsYPos.length; index++) {
            this._fromDotsYPos[index] = fromDotsYPos[index];
        }
    }

    private expandToDotsXPos(): void {
        const toDotsXPos = this._toDotsXPos;
        this._toDotsXPos = new Int32Array(this._space);

        for (let index = 0; index < toDotsXPos.length; index++) {
            this._toDotsXPos[index] = toDotsXPos[index];
        }
    }

    private expandToDotsYPos(): void {
        const toDotsYPos = this._toDotsYPos;
        this._toDotsYPos = new Int32Array(this._space);

        for (let index = 0; index < toDotsYPos.length; index++) {
            this._toDotsYPos[index] = toDotsYPos[index];
        }
    }

    private expandWidths(): void {
        const widths = this._widths;
        this._widths = new Float32Array(this._space);

        for (let index = 0; index < widths.length; index++) {
            this._widths[index] = widths[index];
        }
    }
}