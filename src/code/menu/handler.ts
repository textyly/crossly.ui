import { IMenuHandler } from "./types.js";
import { IUiCanvasBroker } from "../brokers/types.js";

export class MenuHandler implements IMenuHandler {
    private uiCanvasBroker: IUiCanvasBroker;

    constructor(uiCanvasBroker: IUiCanvasBroker) {
        this.uiCanvasBroker = uiCanvasBroker;

        // TODO: refactor!!!
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