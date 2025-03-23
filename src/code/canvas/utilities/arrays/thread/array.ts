import { Thread } from "../../../types.js";
import { ArrayBase } from "../base.js";

export class ThreadArray extends ArrayBase {
    private _visibilities: Array<boolean>;
    private _fromDotsXPositions: Int32Array;
    private _fromDotsYPositions: Int32Array;
    private _toDotsXPositions: Int32Array;
    private _toDotsYPositions: Int32Array;
    private _widths: Int16Array;
    private _colors: Array<string>;

    constructor() {
        super();
        this._visibilities = new Array<boolean>();
        this._fromDotsXPositions = new Int32Array(this.space);
        this._fromDotsYPositions = new Int32Array(this.space);
        this._toDotsXPositions = new Int32Array(this.space);
        this._toDotsYPositions = new Int32Array(this.space);
        this._widths = new Int16Array(this.space);
        this._colors = new Array<string>();
    }

    public get visibilities(): Readonly<Array<boolean>> {
        return this._visibilities;
    }

    public setVisibilities(index: number, visibility: boolean): void {
        this._visibilities[index] = visibility;
    }

    public get fromDotsXPositions(): Readonly<Int32Array> {
        return this._fromDotsXPositions.slice(0, this.length);
    }

    public get fromDotsYPositions(): Readonly<Int32Array> {
        return this._fromDotsYPositions.slice(0, this.length);
    }

    public get toDotsXPositions(): Readonly<Int32Array> {
        return this._toDotsXPositions.slice(0, this.length);
    }

    public get toDotsYPositions(): Readonly<Int32Array> {
        return this._toDotsYPositions.slice(0, this.length);
    }

    public get widths(): Readonly<Int16Array> {
        return this._widths.slice(0, this.length);
    }

    public get colors(): Readonly<Array<string>> {
        return this._colors;
    }

    // this method is being invoked extremely intensively, so it must not accept Thread (an object) because it might require a lot of GC
    public set(index: number, visible: boolean, fromDotXPos: number, fromDotYPos: number, toDotXPos: number, toDotYPos: number): void {
        this._visibilities[index] = visible;
        this._fromDotsXPositions[index] = fromDotXPos;
        this._fromDotsYPositions[index] = fromDotYPos;
        this._toDotsXPositions[index] = toDotXPos;
        this._toDotsYPositions[index] = toDotYPos;
    }

    // this method is being invoked extremely intensively, so it must not accept Thread (an object) because it might require a lot of GC
    public push(visible: boolean, fromDotXPos: number, fromDotYPos: number, toDotXPos: number, toDotYPos: number, width: number, color: string): void {
        super.occupyItemSpace();

        this._visibilities.push(visible);
        this._fromDotsXPositions[this.count] = fromDotXPos;
        this._fromDotsYPositions[this.count] = fromDotYPos;
        this._toDotsXPositions[this.count] = toDotXPos;
        this._toDotsYPositions[this.count] = toDotYPos;
        this._widths[this.count] = width;
        this._colors.push(color);
    }

    public pop(): Thread | undefined {
        if (this.length <= 0) {
            return undefined;
        } else {
            const from = this.length - 1;
            const to = this.length;

            const visible = this._visibilities.pop()!;
            const fromDotXPos = this.fromDotsXPositions.slice(from, to)[0];
            const fromDotYPos = this.fromDotsYPositions.slice(from, to)[0];
            const toDotXPos = this.toDotsXPositions.slice(from, to)[0];
            const toDotYPos = this.toDotsYPositions.slice(from, to)[0];
            const width = this.widths.slice(from, to)[0];
            const color = this._colors.pop()!;

            const thread: Thread = { visible, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos, width, color };

            super.removeItemSpace();

            return thread;
        }
    }

    protected override expand(): void {
        this.expandFromDotsXPositions();
        this.expandFromDotsYPositions();
        this.expandToDotsXPositions();
        this.expandToDotsYPositions();
        this.expandWidths();
    }

    private expandFromDotsXPositions(): void {
        const fromDotsXPositions = this._fromDotsXPositions;
        this._fromDotsXPositions = new Int32Array(this.space);

        for (let index = 0; index < fromDotsXPositions.length; index++) {
            this._fromDotsXPositions[index] = fromDotsXPositions[index];
        }
    }

    private expandFromDotsYPositions(): void {
        const fromDotsYPositions = this._fromDotsYPositions;
        this._fromDotsYPositions = new Int32Array(this.space);

        for (let index = 0; index < fromDotsYPositions.length; index++) {
            this._fromDotsYPositions[index] = fromDotsYPositions[index];
        }
    }

    private expandToDotsXPositions(): void {
        const toDotsXPositions = this._toDotsXPositions;
        this._toDotsXPositions = new Int32Array(this.space);

        for (let index = 0; index < toDotsXPositions.length; index++) {
            this._toDotsXPositions[index] = toDotsXPositions[index];
        }
    }

    private expandToDotsYPositions(): void {
        const toDotsYPositions = this._toDotsYPositions;
        this._toDotsYPositions = new Int32Array(this.space);

        for (let index = 0; index < toDotsYPositions.length; index++) {
            this._toDotsYPositions[index] = toDotsYPositions[index];
        }
    }

    private expandWidths(): void {
        const widths = this._widths;
        this._widths = new Int16Array(this.space);

        for (let index = 0; index < widths.length; index++) {
            this._widths[index] = widths[index];
        }
    }
}