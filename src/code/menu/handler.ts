import { IUiCanvasBroker } from "../brokers/types.js";
import { IMenuHandler } from "./types.js";

export class MenuHandler implements IMenuHandler {
    private broker: IUiCanvasBroker;

    constructor(broker: IUiCanvasBroker) {
        this.broker = broker;

        document.querySelectorAll('.color-button').forEach(button => {
            button.addEventListener('click', (event: any) => {

                const color = event.currentTarget.dataset.color;
                this.broker.change(color);

            });
        });
    }

    public onClickColor(color: string): void {
        this.broker.change(color);
    }

    public onClickUndo(): void {
        throw new Error("Method not implemented.");
    }

    public onClickRedo(): void {
        throw new Error("Method not implemented.");
    }

    public onClickZoomIn(): void {
        throw new Error("Method not implemented.");
    }

    public onClickZoomOut(): void {
        throw new Error("Method not implemented.");
    }
}