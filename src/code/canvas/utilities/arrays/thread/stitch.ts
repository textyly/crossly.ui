import { FabricThreadArray } from "./fabric.js";
import { CanvasSide, StitchTread } from "../../../types.js";

export class StitchThreadArray extends FabricThreadArray {
    private _fromDotsXIdx: Int16Array;
    private _fromDotsYIdx: Int16Array;
    private _toDotsXIdx: Int16Array;
    private _toDotsYIdx: Int16Array;
    private _sides: Array<CanvasSide>;

    constructor() {
        super();

        this._fromDotsXIdx = new Int16Array(this._space);
        this._fromDotsYIdx = new Int16Array(this._space);
        this._toDotsXIdx = new Int16Array(this._space);
        this._toDotsYIdx = new Int16Array(this._space);
        this._sides = new Array<CanvasSide>();
    }

    public get fromDotsXIdx(): Readonly<Int16Array> {
        return this._fromDotsXIdx.slice(0, this.length);
    }

    public get fromDotsYIdx(): Readonly<Int16Array> {
        return this._fromDotsYIdx.slice(0, this.length);
    }

    public get toDotsXIdx(): Readonly<Int16Array> {
        return this._toDotsXIdx.slice(0, this.length);
    }

    public get toDotsYIdx(): Readonly<Int16Array> {
        return this._toDotsYIdx.slice(0, this.length);
    }

    public get sides(): Array<CanvasSide> {
        return this._sides;
    }

    // TODO: change to indexed prop
    // this property is being invoked extremely intensively, so it must not accept StitchThread (an object) because it might require a lot of GC
    public setThread(index: number, visible: boolean, fromDotXIdx: number, fromDotXPos: number, fromDotYIdx: number, fromDotYPos: number, toDotXIdx: number, toDotXPos: number, toDotYIdx: number, toDotYPos: number, width: number, color: string, side: CanvasSide): void {
        super.set(index, visible, fromDotXPos, fromDotYPos, toDotXPos, toDotYPos, width, color);
        this._fromDotsXIdx[index] = fromDotXIdx;
        this._fromDotsYIdx[index] = fromDotYIdx;
        this._toDotsXIdx[index] = toDotXIdx;
        this._toDotsYIdx[index] = toDotYIdx;
        this._sides[index] = side;
    }

    // this method is being invoked only on a thread creation, so it is safe to use an object
    public pushThread(thread: StitchTread): void {
        super.push(thread.visible, thread.fromDotXPos, thread.fromDotYPos, thread.toDotXPos, thread.toDotYPos, thread.width, thread.color);
        this._fromDotsXIdx[this._count] = thread.fromDotXIdx;
        this._fromDotsYIdx[this._count] = thread.fromDotYIdx;
        this._toDotsXIdx[this._count] = thread.toDotXIdx;
        this._toDotsYIdx[this._count] = thread.toDotYIdx;
        this._sides.push(thread.side);
    }

    protected override expand(): void {
        super.expand();
        this.expandFromDotsXIdx();
        this.expandFromDotsYIdx();
        this.expandToDotsXIdx();
        this.expandToDotsYIdx();
    }

    private expandFromDotsXIdx(): void {
        const fromDotsXIdx = this._fromDotsXIdx;
        this._fromDotsXIdx = new Int16Array(this._space);

        for (let index = 0; index < fromDotsXIdx.length; index++) {
            this._fromDotsXIdx[index] = fromDotsXIdx[index];
        }
    }

    private expandFromDotsYIdx(): void {
        const fromDotsYIdx = this._fromDotsYIdx;
        this._fromDotsYIdx = new Int16Array(this._space);

        for (let index = 0; index < fromDotsYIdx.length; index++) {
            this._fromDotsYIdx[index] = fromDotsYIdx[index];
        }
    }

    private expandToDotsXIdx(): void {
        const toDotsXIdx = this._toDotsXIdx;
        this._toDotsXIdx = new Int16Array(this._space);

        for (let index = 0; index < toDotsXIdx.length; index++) {
            this._toDotsXIdx[index] = toDotsXIdx[index];
        }
    }

    private expandToDotsYIdx(): void {
        const toDotsYIdx = this._toDotsYIdx;
        this._toDotsYIdx = new Int16Array(this._space);

        for (let index = 0; index < toDotsYIdx.length; index++) {
            this._toDotsYIdx[index] = toDotsYIdx[index];
        }
    }
}