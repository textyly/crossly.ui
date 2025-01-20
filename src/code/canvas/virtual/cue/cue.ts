import { SizeChangeEvent } from "../../types.js";
import { CueVirtualCanvasBase } from "./base.js";
import { IdGenerator } from "../../../utilities/generator.js";
import { CanvasSide, Dot, ICueVirtualCanvas, Id, IDotVirtualCanvas, Link } from "../types.js";
import { IInputCanvas, MouseLeftButtonDownEvent, MouseMoveEvent, Position } from "../../input/types.js";

export class CueVirtualCanvas extends CueVirtualCanvasBase implements ICueVirtualCanvas {
    private readonly inputCanvas: IInputCanvas;
    private readonly dotVirtualCanvas: IDotVirtualCanvas;
    private readonly ids: IdGenerator;

    private currentLink?: Link;
    private currentSide: CanvasSide;
    private previousClickedDotId?: Id;
    private previousHoveredDotId?: Id;

    constructor(inputCanvas: IInputCanvas, dotVirtualCanvas: IDotVirtualCanvas) {
        super();

        this.inputCanvas = inputCanvas;
        this.dotVirtualCanvas = dotVirtualCanvas;

        this.ids = new IdGenerator();
        this.currentSide = CanvasSide.Default;

        this.subscribe();
    }

    public draw(): void {
        this.ids.reset();

        if (this.previousHoveredDotId) {
            this.handleUnhoverDot(this.previousHoveredDotId);
        }

        if (this.currentLink) {
            const position = this.currentLink.to;
            this.handleLinkChange(position);
        }
    }

    private subscribe(): void {
        const sizeChangeUn = this.dotVirtualCanvas.onSizeChange(this.handleSizeChange.bind(this));
        super.registerUn(sizeChangeUn);

        const zoomInUn = this.inputCanvas.onZoomIn(this.handleZoomIn.bind(this));
        super.registerUn(zoomInUn);

        const zoomOutUn = this.inputCanvas.onZoomOut(this.handleZoomOut.bind(this));
        super.registerUn(zoomOutUn);

        const mouseMoveUn = this.inputCanvas.onMouseMove(this.handleMouseMove.bind(this));
        super.registerUn(mouseMoveUn);

        const mouseLeftButtonDownUn = this.inputCanvas.onMouseLeftButtonDown(this.handleMouseLeftButtonDown.bind(this));
        super.registerUn(mouseLeftButtonDownUn);
    }

    private handleZoomIn(): void {
        this.draw();
    }

    private handleZoomOut(): void {
        this.draw();
    }

    private handleMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        this.handleDotChange(position);
        this.handleLinkChange(position);
    }

    private handleMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const position = event.position;

        const previousClickedDot = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
        if (previousClickedDot) {
            this.changeSide();
            this.previousClickedDotId = previousClickedDot.id;
        }
    }

    private handleDotChange(position: Position): void {
        const hovered = this.dotVirtualCanvas.getDotByCoordinates(position.x, position.y);
        if (hovered) {
            if (hovered.id !== this.previousHoveredDotId) {
                this.previousHoveredDotId = hovered.id;
                const hoveredDot = { id: hovered.id, radius: hovered.radius + 2, x: hovered.x, y: hovered.y }; // TODO: +2 must go outside
                super.invokeHoverDot(hoveredDot);
            }
        } else if (this.previousHoveredDotId) {
            this.handleUnhoverDot(this.previousHoveredDotId);
        }
    }

    private handleUnhoverDot(previousHoveredDotId: string): void {
        const previousHoveredDot = this.dotVirtualCanvas.getDotById(previousHoveredDotId);
        if (previousHoveredDot) {
            super.invokeUnhoverDot(previousHoveredDot);
        }
        this.previousHoveredDotId = undefined;
    }

    private handleLinkChange(position: Position): void {
        const previousClickedDot = this.dotVirtualCanvas.getDotById(this.previousClickedDotId!)!;

        if (previousClickedDot) {
            if (this.currentLink) {
                this.removeLink(this.currentLink);
            }
            this.drawLink(previousClickedDot, position);
        }
    }

    private drawLink(previousClickedDot: Dot, currentMousePosition: Position): void {
        const toDotId = this.ids.next();
        const toDot = { ...currentMousePosition, id: toDotId, radius: previousClickedDot.radius };

        const linkId = this.ids.next();
        this.currentLink = { id: linkId, from: previousClickedDot, to: toDot, side: this.currentSide };

        super.invokeDrawLink(this.currentLink);
    }

    private removeLink(link: Link) {
        super.invokeRemoveLink(link);
        this.currentLink = undefined;
    }

    private changeSide(): void {
        this.currentSide = this.currentSide === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
    }

    private handleSizeChange(event: SizeChangeEvent): void {
        const size = event.size;
        super.size = size;
    }
}