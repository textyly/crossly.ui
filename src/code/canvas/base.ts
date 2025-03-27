import assert from "../asserts/assert.js";
import { VoidUnsubscribe } from "../types.js";
import { Messaging1 } from "../messaging/impl.js";
import { IMessaging1 } from "../messaging/types.js";
import { ICanvas, Bounds, BoundsChangeEvent, BoundsChangeListener } from "./types.js";

export abstract class CanvasBase implements ICanvas {
    private readonly uns: Array<VoidUnsubscribe>;
    private readonly msg: IMessaging1<BoundsChangeEvent>;

    private _bounds: Bounds;

    protected disposed: boolean;
    protected readonly disposedErrMsg: string;

    constructor() {
        this.uns = new Array<VoidUnsubscribe>;
        this.msg = new Messaging1();

        this._bounds = { left: 0, top: 0, width: 0, height: 0 };

        this.disposed = false;
        this.disposedErrMsg = `${CanvasBase.name} instance disposed.`;
    }

    public get bounds(): Bounds {
        this.throwIfDisposed();
        return this._bounds;
    }

    public set bounds(bounds: Bounds) {
        this.throwIfDisposed();

        const hasChange =
            (this._bounds.left !== bounds.left) ||
            (this._bounds.top !== bounds.top) ||
            (this._bounds.width !== bounds.width) ||
            (this._bounds.height !== bounds.height);

        if (hasChange) {
            this._bounds = bounds;
            this.invokeBoundsChange(this._bounds);
        }
    }

    public dispose(): void {
        this.throwIfDisposed();

        this.uns.forEach((un) => un());
        this.msg.dispose();

        this.disposed = true;
    }

    public onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe {
        this.throwIfDisposed();

        return this.msg.listenOnChannel1(listener);
    }

    protected invokeBoundsChange(bounds: Bounds): void {
        this.throwIfDisposed();

        const event = { bounds };
        this.msg.sendToChannel1(event);
    }

    protected registerUn(func: VoidUnsubscribe): void {
        this.throwIfDisposed();

        this.uns.push(func);
    }

    protected throwIfDisposed(): void {
        assert.that(!this.disposed, this.disposedErrMsg);
    }
}