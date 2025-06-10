import { IMenuHandler } from "./types.js";
import { IUiCanvasBroker } from "../brokers/types.js";
import assert from "../asserts/assert.js";

export class MenuHandler implements IMenuHandler {
    private uiCanvasBroker: IUiCanvasBroker;
    private zoom = 120;

    constructor(uiCanvasBroker: IUiCanvasBroker) {
        // TODO: refactor!!!
        this.uiCanvasBroker = uiCanvasBroker;

        const zoomLevel = document.getElementById("zoom-level");
        zoomLevel!.innerHTML = `${this.zoom}%`;

        uiCanvasBroker.onZoomIn(() => {
            this.zoom += 10;

            const zoomLevel = document.getElementById("zoom-level");
            zoomLevel!.innerHTML = `${this.zoom}%`;
        });

        uiCanvasBroker.onZoomOut(() => {
            this.zoom -= 10;

            const zoomLevel = document.getElementById("zoom-level");
            zoomLevel!.innerHTML = `${this.zoom}%`;
        });

        document.querySelectorAll('.color-button').forEach(button => {
            button.addEventListener('click', (event: any) => {

                const color = event.currentTarget.dataset.color;
                this.clickColor(color);

            });
        });

        document.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', (event: any) => {

                const action = event.currentTarget.dataset.action;
                switch (action) {
                    case 'undo':
                        this.clickUndo();
                        break;
                    case 'redo':
                        this.clickRedo();
                        break;
                    case 'zoom-in':
                        this.clickZoomIn();
                        break;
                    case 'zoom-out':
                        this.clickZoomOut();
                        break;
                    case 'split':
                    case 'close':
                        const backSideContainer = document.getElementById("back-side-container");
                        assert.defined(backSideContainer?.style?.display, "");
                        backSideContainer.style.display = backSideContainer.style.display === "flex" || backSideContainer.style.display === "" ? "none" : "flex";
                        break;
                }

            });
        });
    }

    public clickColor(color: string): void {
        this.uiCanvasBroker.change(color);
    }

    public clickUndo(): void {
        this.uiCanvasBroker.undo();
    }

    public clickRedo(): void {
        this.uiCanvasBroker.redo();
    }

    public clickZoomIn(): void {
        this.uiCanvasBroker.zoomIn();
    }

    public clickZoomOut(): void {
        this.uiCanvasBroker.zoomOut();
    }
}