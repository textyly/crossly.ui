import { VirtualCanvas } from "./base.js";
import { VirtualDotCanvas } from "./dot.js";
import { CanvasSide, Line, Link } from "./types.js";
import { IdGenerator } from "../../utilities/generator.js";
import { MouseMoveEvent, MouseLeftButtonDownEvent } from "../transparent/types.js";

export class VirtualLineCanvas extends VirtualCanvas {
    // #region fields

    private dotVirtualCanvas: VirtualDotCanvas;

    private link?: Link;
    private lines: Array<Line>;
    private side: CanvasSide;

    private idGenerator: IdGenerator;

    // #endregion

    constructor(virtualDotCanvas: VirtualDotCanvas) {
        super();

        this.dotVirtualCanvas = virtualDotCanvas;

        this.lines = [];
        this.side = CanvasSide.Back;

        this.idGenerator = new IdGenerator();
    }
    // #region interface 

    public draw(): void {
        this.idGenerator.reset();

        this.lines = this.createLines();

        this.lines.forEach((line) => {
            const lineEvent = { line };
            super.invokeDrawLine(lineEvent);
        });
    }

    public invokeZoomIn(): void {
        this.draw();

        if (this.link) {
            const position = this.link.to;
            this.invokeMouseMove({ position });
        }
    }

    public invokeZoomOut(): void {
        this.draw();

        if (this.link) {
            const position = this.link.to;
            this.invokeMouseMove({ position });
        }
    }

    public invokeMouseMove(event: MouseMoveEvent): void {
        const position = event.position;
        const clickedDot = this.dotVirtualCanvas.clickedDot;

        if (!clickedDot) {
            return;
        }

        if (this.link) {
            super.invokeRemoveLink({ link: this.link });
        }

        const id = this.idGenerator.next();
        const from = clickedDot;
        const to = { id, x: position.x, y: position.y, radius: clickedDot.radius };
        const side = this.side;

        this.link = { id, from, to, side };
        super.invokeDrawLink({ link: this.link });
    }

    public invokeMouseLeftButtonDown(event: MouseLeftButtonDownEvent): void {
        const clickedDot = this.dotVirtualCanvas.clickedDot;

        if (!clickedDot) {
            // TODO: check this case when clicking on the same dot multiple times
            this.side = CanvasSide.Front;
            return;
        }

        const hoveredDot = this.dotVirtualCanvas.hoveredDot;
        if (hoveredDot) {
            const line = { from: clickedDot, to: hoveredDot, side: this.side };
            this.lines.push(line);

            super.invokeDrawLine({ line });

            this.side = this.side === CanvasSide.Front ? CanvasSide.Back : CanvasSide.Front;
        }
    }

    // #endregion

    // #region methods

    private createLines(): Array<Line> {
        const lines = new Array<Line>();

        this.lines.forEach((line) => {
            const from = this.dotVirtualCanvas.get(line.from.id)!; // TODO: what if undefined ???
            const to = this.dotVirtualCanvas.get(line.to.id)!; // TODO: what if undefined ???
            const l = { from, to, side: line.side };
            lines.push(l);
        });

        return lines;
    }

    // #endregion
}