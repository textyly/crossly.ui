import { IMenuHandler } from "./types.js";
import { IUiCanvasBroker } from "../brokers/types.js";

export class MenuHandler implements IMenuHandler {
    private broker: IUiCanvasBroker;

    constructor(broker: IUiCanvasBroker) {
        this.broker = broker;

        // TODO: refactor!!!
        document.querySelectorAll('.color-button').forEach(button => {
            button.addEventListener('click', (event: any) => {

                const color = event.currentTarget.dataset.color;
                this.broker.change(color);

            });
        });

        document.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('click', (event: any) => {

                const action = event.currentTarget.dataset.action
                    ;
                switch (action) {
                    case 'undo':
                        this.onClickUndo();
                        break;
                    case 'redo':
                        this.onClickRedo();
                        break;
                    case 'zoom-in':
                        this.onClickZoomIn();
                        break;
                    case 'zoom-out':
                        this.onClickZoomOut();
                        break;
                }

            });
        });
    }

    public onClickColor(color: string): void {
        this.broker.change(color);
    }

    public onClickUndo(): void {
        this.broker.undo();
    }

    public onClickRedo(): void {
        this.broker.redo();
    }

    public onClickZoomIn(): void {
        this.broker.zoomIn();
    }

    public onClickZoomOut(): void {
        this.broker.zoomOut();
    }
}