import { Base } from "../../base.js";
import { ICrosslyCanvas } from "../types.js";
import assert from "../../asserts/assert.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { IThreadPath } from "../utilities/arrays/types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../virtual/types.js";
import { ChangeEvent, ChangeListener, CrosslyCanvasData, ICrosslyCanvasObserver } from "../types.js";

export class CrosslyCanvasObserver extends Base implements ICrosslyCanvasObserver {
    private readonly messaging: IMessaging1<ChangeEvent>;
    private readonly canvas: ICrosslyCanvas;

    private data: CrosslyCanvasData;

    constructor(canvas: ICrosslyCanvas) {
        super(CrosslyCanvasObserver.name);

        this.canvas = canvas;
        this.messaging = new Messaging1();

        const name = this.canvas.config.name;
        const fabric = this.canvas.config.fabric;

        const pattern = new Array<IThreadPath>();
        this.data = { name, fabric, pattern };

        this.subscribe();
    }

    public onChange(listener: ChangeListener): VoidUnsubscribe {
        super.ensureAlive();
        return this.messaging.listenOnChannel1(listener);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.ensureAlive();

        assert.defined(this.data, "data");

        const fabric = event.fabric;
        this.data.fabric = fabric;

        this.invokeDataChange(this.data);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();

        assert.defined(this.data, "data");

        const pattern = event.pattern;
        this.data.pattern = pattern;

        this.invokeDataChange(this.data);
    }

    private invokeDataChange(data: CrosslyCanvasData): void {
        const event = { data };
        this.messaging.sendToChannel1(event);
    }

    private subscribe() {
        const unChangeFabric = this.canvas.onChangeFabric(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }
}