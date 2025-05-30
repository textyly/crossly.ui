import { Base } from "../../general/base.js";
import { VoidUnsubscribe } from "../../types.js";
import { ICrosslyCanvasFacade } from "../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../virtual/types.js";
import { CrosslyCanvasPattern, ICrosslyCanvasObserver, CrosslyCanvasChangeEvent, CrosslyCanvasChangeListener } from "../types.js";

export class CrosslyCanvasObserver extends Base implements ICrosslyCanvasObserver {
    private readonly canvasFacade: ICrosslyCanvasFacade;
    private readonly messaging: IMessaging1<CrosslyCanvasChangeEvent>;

    private data: CrosslyCanvasPattern;

    constructor(canvas: ICrosslyCanvasFacade) {
        super(CrosslyCanvasObserver.name);

        this.messaging = new Messaging1();

        this.canvasFacade = canvas;
        const pattern = this.canvasFacade.pattern;

        // TODO
        this.data = { fabric: pattern.fabric, stitch: pattern.stitch };

        this.subscribe();
    }

    public onChange(listener: CrosslyCanvasChangeListener): VoidUnsubscribe {
        super.ensureAlive();

        return this.messaging.listenOnChannel1(listener);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.ensureAlive();

        this.data.fabric = event.pattern;
        this.invokeDataChange(this.data);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();

        this.data.stitch = event.pattern;
        this.invokeDataChange(this.data);
    }

    private invokeDataChange(pattern: CrosslyCanvasPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    private subscribe() {
        const unChangeFabric = this.canvasFacade.onChangeFabric(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.canvasFacade.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }
}