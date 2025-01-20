import { ICanvas, Size } from "./types.js";
import { VoidUnsubscribe } from "../types.js";
import { Messaging1 } from "../messaging/impl.js";
import { IMessaging1 } from "../messaging/types.js";
import { SizeChangeEvent, SizeChangeListener } from "./input/types.js";

export abstract class CanvasBase implements ICanvas {
    private readonly uns: Array<VoidUnsubscribe>;
    private readonly msg: IMessaging1<SizeChangeEvent>;

    private width: number;
    private height: number;

    constructor() {
        this.uns = new Array<VoidUnsubscribe>;
        this.msg = new Messaging1();

        this.width = 0;
        this.height = 0;
    }

    public get size(): Size {
        const size = { width: this.width, height: this.height };
        return size;
    }

    public set size(value: Size) {
        const currentWidth = this.width;
        const currentHeight = this.height;
        const newWidth = value.width;
        const newHeight = value.height;

        if (currentWidth !== newWidth || currentHeight !== newHeight) {
            this.width = newWidth;
            this.height = newHeight;
            this.invokeSizeChange(value);
        }
    }

    public dispose(): void {
        this.uns.forEach((un) => un());
        this.msg.dispose();
    }

    public onSizeChange(listener: SizeChangeListener): VoidUnsubscribe {
        return this.msg.listenOnChannel1(listener);
    }

    protected registerUn(func: VoidUnsubscribe): void {
        this.uns.push(func);
    }

    private invokeSizeChange(event: SizeChangeEvent): void {
        this.msg.sendToChannel1(event);
    }
}