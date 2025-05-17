import { Base } from "../../base.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { ChangeNameEvent, ICrosslyCanvasFacade } from "../types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../virtual/types.js";
import {
    CrosslyCanvasPattern,
    ICrosslyCanvasObserver,
    CrosslyCanvasChangeEvent,
    CrosslyCanvasChangeListener,
} from "../types.js";

export class CrosslyCanvasObserver extends Base implements ICrosslyCanvasObserver {
    private readonly canvasFacade: ICrosslyCanvasFacade;
    private readonly messaging: IMessaging1<CrosslyCanvasChangeEvent>;

    private data: CrosslyCanvasPattern;

    constructor(canvas: ICrosslyCanvasFacade) {
        super(CrosslyCanvasObserver.name);

        this.messaging = new Messaging1();

        this.canvasFacade = canvas;
        const name = this.canvasFacade.name;
        const fabricPattern = this.canvasFacade.fabricPattern;
        const stitchPattern = this.canvasFacade.stitchPattern;
        this.data = { name, fabricPattern: fabricPattern, stitchPattern: stitchPattern };

        this.subscribe();
    }

    public onChange(listener: CrosslyCanvasChangeListener): VoidUnsubscribe {
        super.ensureAlive();

        return this.messaging.listenOnChannel1(listener);
    }

    private handleChangeName(event: ChangeNameEvent): void {
        super.ensureAlive();

        this.data.name = event.name;
        this.invokeDataChange(this.data);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.ensureAlive();

        this.data.fabricPattern = event.fabric;
        this.invokeDataChange(this.data);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();

        this.data.stitchPattern = event.pattern;
        this.invokeDataChange(this.data);
    }

    private invokeDataChange(pattern: CrosslyCanvasPattern): void {
        const event = { pattern };
        this.messaging.sendToChannel1(event);
    }

    private subscribe() {
        const unChangeName = this.canvasFacade.onChangeName(this.handleChangeName.bind(this));
        super.registerUn(unChangeName);

        const unChangeFabric = this.canvasFacade.onChangeFabric(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.canvasFacade.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }
}