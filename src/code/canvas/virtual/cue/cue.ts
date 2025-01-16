import { CanvasSide, ICueVirtualCanvas, Id, Link } from "../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, MouseMoveEvent, Position } from "../../input/types.js";
import { DotVirtualCanvas } from "../dot/dot.js";
import { CueVirtualCanvasBase } from "./base.js";

export class CueVirtualCanvas extends CueVirtualCanvasBase implements ICueVirtualCanvas {
    private readonly dotVirtualCanvas: DotVirtualCanvas;
    private readonly inputCanvas: IInputCanvas;

    private clicked?: Id;
    private hovered?: Id;
    private link?: Link;
    private side: CanvasSide;

    constructor(dotVirtualCanvas: DotVirtualCanvas, inputCanvas: IInputCanvas) {
        super();
        this.dotVirtualCanvas = dotVirtualCanvas;
        this.inputCanvas = inputCanvas;
        this.side = CanvasSide.Default;
    }

    protected override initializeCore(): void {
        super.initializeCore();

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseMoveUn = this.inputCanvas.onMouseMove(this.handleMouseMove.bind(this));
        super.registerUn(mouseMoveUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);
    }

    public draw(): void {
        // TODO: 
    }

    public handleZoomIn(): void {
        if (this.hovered) {
            this.handleUnhoverDot();
        }
        if (this.link) {
            const position = this.link.to;
            this.handleDrawLink(position);
        }
    }

    public handleZoomOut(): void {
        if (this.hovered) {
            this.handleUnhoverDot();
        }
        if (this.link) {
            const position = this.link.to;
            this.handleDrawLink(position);
        }
    }

    public handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        this.handleHoverDot(position);
        this.handleDrawLink(position);
    }

    public handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;
        this.handleDotClick(position);
    }

    private handleDotClick(position: Position): void {
        const clicked = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
        if (clicked) {
            if (!this.clicked) {
                this.side = CanvasSide.Front;
            } else {
                this.side = this.side === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
            }
            this.clicked = clicked.id;
        }
    }

    private handleDrawLink(position: Position): void {
        if (this.clicked) {
            if (this.link) {
                this.handleRemoveLink(this.link);
            }

            const clicked = this.dotVirtualCanvas.getDotById(this.clicked!)!;
            const from = clicked;
            const to = { ...position, id: "111", radius: clicked.radius };
            this.link = { id: "111", from, to, side: this.side };
            super.invokeDrawLink(this.link);
        }
    }

    private handleRemoveLink(link: Link) {
        super.invokeRemoveLink(link);
        this.link = undefined;
    }

    private handleHoverDot(position: Position): void {
        const hovered = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
        if (hovered) {
            if (hovered.id !== this.hovered) {
                this.hovered = hovered.id;
                const hoveredDot = { id: hovered.id, radius: hovered.radius + 2, x: hovered.x, y: hovered.y };
                super.invokeHoverDot(hoveredDot);
            }
        } else if (this.hovered) {
            this.handleUnhoverDot();
        }
    }

    private handleUnhoverDot(): void {
        const hovered = this.dotVirtualCanvas.getDotById(this.hovered!)!;
        super.invokeUnhoverDot(hovered);
        this.hovered = undefined;
    }
}