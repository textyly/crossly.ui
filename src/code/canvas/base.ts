import { ICanvas, Size } from "./types.js";
import { Messaging1 } from "../messaging/impl.js";
import { IMessaging1 } from "../messaging/types.js";
import { VoidUnsubscribe } from "../types.js";
import { SizeValidator } from "../validators/canvas/size.js";
import { SizeChangeEvent, SizeChangeListener } from "./input/types.js";

export abstract class CanvasBase implements ICanvas {
    // #region fields

    private readonly sizeValidator: SizeValidator;
    private readonly msg: IMessaging1<SizeChangeEvent>;
    private readonly unFuncs: Array<VoidUnsubscribe>;

    private width: number;
    private height: number;

    //#endregion

    constructor() {
        this.width = 0;
        this.height = 0;

        this.sizeValidator = new SizeValidator();

        const className = CanvasBase.name;
        this.msg = new Messaging1(className);
        this.msg.start();

        this.unFuncs = new Array<VoidUnsubscribe>;
    }

    // #region interface

    public get size(): Size {
        const size = { width: this.width, height: this.height };
        return size;
    }

    public set size(value: Size) {
        this.sizeValidator.validateSize(value);

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
        this.unFuncs.forEach((un) => un()); // TODO: handle exceptions
        this.msg.stop();
    }

    // #region interface

    // #region events

    public onSizeChange(listener: SizeChangeListener): VoidUnsubscribe {
        return this.msg.listenOnChannel1(listener);
    }

    private invokeSizeChange(event: SizeChangeEvent): void {
        this.msg.sendToChannel1(event);
    }

    // #endregion

    // #region methods

    protected registerUn(func: VoidUnsubscribe): void {
        this.unFuncs.push(func);
    }

    // #endregion 

}