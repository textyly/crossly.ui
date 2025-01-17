import { Size } from "../types.js";
import { DotVirtualCanvas } from "./dot/dot.js";
import { CueVirtualCanvas } from "./cue/cue.js";
import { LineVirtualCanvas } from "./line/line.js";
import { IInputCanvas } from "../input/types.js";
import { VirtualCanvasBase } from "./base.js";
import {
    DotsConfig,
    DrawDotEvent,
    DrawLineEvent,
    DrawLinkEvent,
    HoverDotEvent,
    RemoveLinkEvent,
    UnhoverDotEvent
} from "./types.js";

export class VirtualCanvas extends VirtualCanvasBase {
    // #region fields 

    private inputCanvas: IInputCanvas
    private dotVirtualCanvas: DotVirtualCanvas;
    private lineVirtualCanvas: LineVirtualCanvas;
    private cueVirtualCanvas: CueVirtualCanvas;

    //#endregion

    constructor(config: DotsConfig, inputCanvas: IInputCanvas) {
        super();
        this.inputCanvas = inputCanvas;
        this.dotVirtualCanvas = new DotVirtualCanvas(config, this.inputCanvas);
        this.lineVirtualCanvas = new LineVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
        this.cueVirtualCanvas = new CueVirtualCanvas(this.dotVirtualCanvas, this.inputCanvas);
    }

    // #region interface

    public draw(): void {
        this.dotVirtualCanvas.draw();
        this.lineVirtualCanvas.draw();
        this.cueVirtualCanvas.draw();
    }

    // #endregion 

    // #region overrides

    public override initialize(): void {
        super.initialize();
        this.dotVirtualCanvas.initialize();
        this.lineVirtualCanvas.initialize();
        this.cueVirtualCanvas.initialize();
        this.subscribe();
    }

    public override dispose(): void {
        this.cueVirtualCanvas.dispose();
        this.lineVirtualCanvas.dispose();
        this.dotVirtualCanvas.dispose();
        super.dispose();
    }

    // #endregion

    // #region events

    private handleDrawDot(event: DrawDotEvent): void {
        const dot = event.dot;
        super.invokeDrawDot({ dot });
    }

    private handleDrawLine(event: DrawLineEvent): void {
        const line = event.line;
        super.invokeDrawLine({ line });
    }

    private handleDrawLink(event: DrawLinkEvent): void {
        const link = event.link;
        super.invokeDrawLink({ link });
    }

    private handleRemoveLink(event: RemoveLinkEvent): void {
        const link = event.link;
        super.invokeRemoveLink({ link });
    }

    private handleHoverDot(event: HoverDotEvent): void {
        const dot = event.dot;
        super.invokeHoverDot({ dot });
    }

    private handleUnhoverDot(event: UnhoverDotEvent): void {
        const dot = event.dot;
        super.invokeUnhoverDot({ dot });
    }

    private handleSizeChange(size: Size): void {
        super.size = size;
        this.inputCanvas.size = size;
    }

    // #endregion

    // #region methods

    private subscribe(): void {
        const drawDotUn = this.dotVirtualCanvas.onDrawDot(this.handleDrawDot.bind(this));
        super.registerUn(drawDotUn);

        const dotCanvasSizeChangedUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(dotCanvasSizeChangedUn);

        const drawLineUn = this.lineVirtualCanvas.onDrawLine(this.handleDrawLine.bind(this));
        super.registerUn(drawLineUn);

        const drawLinkUn = this.cueVirtualCanvas.onDrawLink(this.handleDrawLink.bind(this));
        super.registerUn(drawLinkUn);

        const removeLinkUn = this.cueVirtualCanvas.onRemoveLink(this.handleRemoveLink.bind(this));
        super.registerUn(removeLinkUn);

        const hoverDotUn = this.cueVirtualCanvas.onHoverDot(this.handleHoverDot.bind(this));
        super.registerUn(hoverDotUn);

        const unhoverDotUn = this.cueVirtualCanvas.onUnhoverDot(this.handleUnhoverDot.bind(this));
        super.registerUn(unhoverDotUn);
    }

    // #endregion
}