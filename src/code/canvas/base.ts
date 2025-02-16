import { VoidUnsubscribe } from "../types.js";
import { Messaging1 } from "../messaging/impl.js";
import { IMessaging1 } from "../messaging/types.js";
import { ICanvas, Bounds, BoundsChangeEvent, BoundsChangeListener } from "./types.js";

export abstract class CanvasBase implements ICanvas {
    private readonly uns: Array<VoidUnsubscribe>;
    private readonly msg: IMessaging1<BoundsChangeEvent>;

    private left = 0;
    private top = 0;
    private width = 0;
    private height = 0;

    constructor() {
        this.uns = new Array<VoidUnsubscribe>;
        this.msg = new Messaging1();
    }

    public get bounds(): Bounds {
        const bounds = { left: this.left, top: this.top, width: this.width, height: this.height };
        return bounds;
    }

    public set bounds(value: Bounds) {
        const newLeft = value.left;
        const newTop = value.top;
        const newWidth = value.width;
        const newHeight = value.height;

        if (this.left !== newLeft || this.top !== newTop || this.width !== newWidth || this.height !== newHeight) {
            this.left = newLeft;
            this.top = newTop;
            this.width = newWidth;
            this.height = newHeight;
            this.invokeBoundsChange(value);
        }
    }

    public dispose(): void {
        this.uns.forEach((un) => un());
        this.msg.dispose();
    }

    public onBoundsChange(listener: BoundsChangeListener): VoidUnsubscribe {
        return this.msg.listenOnChannel1(listener);
    }

    protected invokeBoundsChange(bounds: Bounds): void {
        const event = { bounds };
        this.msg.sendToChannel1(event);
    }

    protected registerUn(func: VoidUnsubscribe): void {
        this.uns.push(func);
    }
}