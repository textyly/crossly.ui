import { IZoomComponent } from "./types.js";
import { Base } from "../../general/base.js";
import assert from "../../asserts/assert.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";

export class ZoomComponent extends Base implements IZoomComponent {
    private messaging: IMessaging1<VoidEvent>;

    private readonly container: Element;
    private readonly zoominButton: Element;
    private readonly zoomoutButton: Element;

    private currentZoomLevel: number;
    private readonly zoomLevelLabel: Element;

    private zoominListener: (event: Event) => void;
    private zoomoutListener: (event: Event) => void;

    constructor(container: Element) {
        super(ZoomComponent.name);

        this.container = container;
        this.messaging = new Messaging1();

        const zoomLevel = container.querySelector("#zoom-level");
        assert.defined(zoomLevel, "zoomLevel");
        this.zoomLevelLabel = zoomLevel;
        this.currentZoomLevel = 120;
        this.updateZoomLevel(this.currentZoomLevel);

        const zoominElement = container.querySelector("#zoom-in");
        assert.defined(zoominElement, "zoominElement");
        this.zoominButton = zoominElement;

        const zoomoutElement = container.querySelector("#zoom-out");
        assert.defined(zoomoutElement, "zoomoutElement");
        this.zoomoutButton = zoomoutElement;

        this.zoominListener = () => { };
        this.zoomoutListener = () => { };

        this.subscribe();
    }

    public onZoomIn(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel0(listener);
    }

    public onZoomOut(listener: VoidListener): VoidUnsubscribe {
        return this.messaging.listenOnChannel1(listener);
    }

    public zoomIn(): void {
        this.currentZoomLevel += 10;
        this.updateZoomLevel(this.currentZoomLevel);
    }

    public zoomOut(): void {
        this.currentZoomLevel -= 10;
        this.updateZoomLevel(this.currentZoomLevel);
    }

    public override dispose(): void {
        this.unsubscribe();
        this.messaging.dispose();
        super.dispose();
    }

    private updateZoomLevel(value: number) {
        this.zoomLevelLabel.innerHTML = `${value}%`;
    }

    private subscribe(): void {
        this.zoominListener = this.handleZoomIn.bind(this);
        this.zoominButton.addEventListener("click", this.zoominListener);

        this.zoomoutListener = this.handleZoomout.bind(this);
        this.zoomoutButton.addEventListener("click", this.zoomoutListener);
    }

    private unsubscribe(): void {
        this.zoominButton.removeEventListener("click", this.zoominListener);
        this.zoomoutButton.removeEventListener("click", this.zoomoutListener);
    }

    private handleZoomIn(): void {
        this.invokeZoomIn();
    }

    private handleZoomout(): void {
        this.invokeZoomOut();
    }

    private invokeZoomIn(): void {
        this.messaging.sendToChannel0();
    }

    private invokeZoomOut(): void {
        const event = {};
        this.messaging.sendToChannel1(event);
    }
}