import { IZoomMenu } from "./types.js";
import { Base } from "../../general/base.js";
import html from "../../utilities.ts/html.js";
import { Messaging1 } from "../../messaging/impl.js";
import { IMessaging1 } from "../../messaging/types.js";
import { VoidEvent, VoidListener, VoidUnsubscribe } from "../../types.js";

export class ZoomMenu extends Base implements IZoomMenu {
    private messaging: IMessaging1<VoidEvent>;

    private readonly zoomInId = "zoom-in";
    private readonly zoomOutId = "zoom-out";
    private readonly zoomLevelId = "zoom-level";

    private readonly zoominButton: Element;
    private readonly zoomoutButton: Element;

    private currentZoomLevel: number;
    private readonly zoomLevelLabel: Element;

    private zoominListener: (event: Event) => void;
    private zoomoutListener: (event: Event) => void;

    constructor(container: Element) {
        super(ZoomMenu.name);

        this.messaging = new Messaging1();

        this.zoomLevelLabel = html.getById(container, this.zoomLevelId);
        this.currentZoomLevel = 120;
        this.updateZoomLevel(this.currentZoomLevel);

        this.zoominButton = html.getById(container, this.zoomInId);
        this.zoomoutButton = html.getById(container, this.zoomOutId);

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
        super.ensureAlive();
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