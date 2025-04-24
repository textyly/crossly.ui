import { Base } from "../../base.js";
import assert from "../../asserts/assert.js";
import { VoidUnsubscribe } from "../../types.js";
import { Messaging1 } from "../../messaging/impl.js";
import { ICrosslyCanvas } from "../types.js";
import { IMessaging1 } from "../../messaging/types.js";
import { IThreadPath } from "../utilities/arrays/types.js";
import { ChangeFabricEvent, ChangeStitchPatternEvent } from "../virtual/types.js";
import { ChangeEvent, ChangeListener, CrosslyCanvasProject, ICrosslyCanvasObserver } from "../types.js";

export class CrosslyCanvasObserver extends Base implements ICrosslyCanvasObserver {
    private readonly messaging: IMessaging1<ChangeEvent>;
    private readonly canvas: ICrosslyCanvas;

    private project: CrosslyCanvasProject;

    constructor(canvas: ICrosslyCanvas) {
        super(CrosslyCanvasObserver.name);

        this.canvas = canvas;
        this.messaging = new Messaging1();

        const name = this.canvas.config.name;
        assert.defined(name, "name");

        const fabric = this.canvas.config.fabric;
        assert.defined(fabric, "FabricCanvasConfig");

        const pattern = new Array<IThreadPath>();
        this.project = { name, fabric, pattern };

        this.subscribe();
    }

    public onChange(listener: ChangeListener): VoidUnsubscribe {
        super.ensureAlive();
        return this.messaging.listenOnChannel1(listener);
    }

    private handleChangeFabric(event: ChangeFabricEvent): void {
        super.ensureAlive();

        const fabric = event.fabric;
        assert.defined(fabric, "Fabric");
        assert.defined(this.project, "project");

        this.project.fabric = fabric;
        this.invokeProjectChange(this.project);
    }

    private handleChangeStitchPattern(event: ChangeStitchPatternEvent): void {
        super.ensureAlive();

        const pattern = event.pattern;
        assert.defined(event.pattern, "StitchPattern");
        assert.defined(this.project, "project");

        this.project.pattern = pattern;
        this.invokeProjectChange(this.project);
    }

    private invokeProjectChange(project: CrosslyCanvasProject): void {
        const event = { project };
        this.messaging.sendToChannel1(event);
    }

    private subscribe() {
        const unChangeFabric = this.canvas.onChangeFabric(this.handleChangeFabric.bind(this));
        super.registerUn(unChangeFabric);

        const unChangeStitchPattern = this.canvas.onChangeStitchPattern(this.handleChangeStitchPattern.bind(this));
        super.registerUn(unChangeStitchPattern);
    }
}