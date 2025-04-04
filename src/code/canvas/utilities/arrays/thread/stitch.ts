import { ThreadArray } from "./array.js";
import { CanvasSide, StitchTread } from "../../../types.js";

export class StitchThreadArray extends ThreadArray {
    private _fromDotsXIndexes: Int16Array;
    private _fromDotsYIndexes: Int16Array;
    private _toDotsXIndexes: Int16Array;
    private _toDotsYIndexes: Int16Array;
    private _zoomedWidths: Int16Array;
    private _sides: Array<CanvasSide>;

    constructor() {
        super();

        this._fromDotsXIndexes = new Int16Array(this.space);
        this._fromDotsYIndexes = new Int16Array(this.space);
        this._toDotsXIndexes = new Int16Array(this.space);
        this._toDotsYIndexes = new Int16Array(this.space);
        this._zoomedWidths = new Int16Array(this.space);
        this._sides = new Array<CanvasSide>();
    }

    public get fromDotsXIndexes(): Readonly<Int16Array> {
        return this._fromDotsXIndexes.slice(0, this.length);
    }

    public get fromDotsYIndexes(): Readonly<Int16Array> {
        return this._fromDotsYIndexes.slice(0, this.length);
    }

    public get toDotsXIndexes(): Readonly<Int16Array> {
        return this._toDotsXIndexes.slice(0, this.length);
    }

    public get toDotsYIndexes(): Readonly<Int16Array> {
        return this._toDotsYIndexes.slice(0, this.length);
    }

    public get zoomedWidths(): Readonly<Int16Array> {
        return this._zoomedWidths.slice(0, this.length);
    }

    public get sides(): Array<CanvasSide> {
        return this._sides;
    }

    public setThread(index: number, visible: boolean, fromDotXPos: number, fromDotYPos: number, toDotXPos: number, toDotYPos: number, zoomedWidth: number) {
        super.set(index, visible, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos);
        this._zoomedWidths[index] = zoomedWidth;
    }

    // this method is being invoked only on a thread creation, so it is safe to use a StitchTread object
    public pushThread(thread: StitchTread): void {
        super.push(thread.visible, thread.fromDotXPos, thread.fromDotYPos, thread.toDotXPos, thread.toDotYPos, thread.width, thread.color);
        this._fromDotsXIndexes[this.count] = thread.fromDotXIdx;
        this._fromDotsYIndexes[this.count] = thread.fromDotYIdx;
        this._toDotsXIndexes[this.count] = thread.toDotXIdx;
        this._toDotsYIndexes[this.count] = thread.toDotYIdx;
        this._zoomedWidths[this.count] = thread.zoomedWidth;
        this._sides.push(thread.side);
    }

    public popThread(): StitchTread | undefined {
        if (this.length <= 0) {
            return undefined;
        } else {
            const from = this.length - 1;
            const to = this.length;

            const fromDotXIdx = this.fromDotsXIndexes.slice(from, to)[0];
            const fromDotYIdx = this.fromDotsYIndexes.slice(from, to)[0];
            const toDotXIdx = this.toDotsXIndexes.slice(from, to)[0];
            const toDotYIdx = this.toDotsYIndexes.slice(from, to)[0];
            const zoomedWidth = this.zoomedWidths.slice(from, to)[0];
            const side = this._sides.pop()!;
            const thread = super.pop()!;

            const stitchThread: StitchTread = { ...thread, fromDotXIdx, fromDotYIdx, toDotXIdx, toDotYIdx, zoomedWidth, side };
            return stitchThread;
        }
    }

    protected override expand(): void {
        super.expand();
        this.expandFromDotsXIndexes();
        this.expandFromDotsYIndexes();
        this.expandToDotsXIndexes();
        this.expandToDotsYIndexes();
        this.expandZoomedWidths();
    }

    private expandFromDotsXIndexes(): void {
        const fromDotsXIndexes = this._fromDotsXIndexes;
        this._fromDotsXIndexes = new Int16Array(this.space);

        for (let index = 0; index < fromDotsXIndexes.length; index++) {
            this._fromDotsXIndexes[index] = fromDotsXIndexes[index];
        }
    }

    private expandFromDotsYIndexes(): void {
        const fromDotsYIndexes = this._fromDotsYIndexes;
        this._fromDotsYIndexes = new Int16Array(this.space);

        for (let index = 0; index < fromDotsYIndexes.length; index++) {
            this._fromDotsYIndexes[index] = fromDotsYIndexes[index];
        }
    }

    private expandToDotsXIndexes(): void {
        const toDotsXIndexes = this._toDotsXIndexes;
        this._toDotsXIndexes = new Int16Array(this.space);

        for (let index = 0; index < toDotsXIndexes.length; index++) {
            this._toDotsXIndexes[index] = toDotsXIndexes[index];
        }
    }

    private expandToDotsYIndexes(): void {
        const toDotsYIndexes = this._toDotsYIndexes;
        this._toDotsYIndexes = new Int16Array(this.space);

        for (let index = 0; index < toDotsYIndexes.length; index++) {
            this._toDotsYIndexes[index] = toDotsYIndexes[index];
        }
    }

    private expandZoomedWidths(): void {
        const zoomedWidths = this._zoomedWidths;
        this._zoomedWidths = new Int16Array(this.space);

        for (let index = 0; index < zoomedWidths.length; index++) {
            this._zoomedWidths[index] = zoomedWidths[index];
        }
    }
}