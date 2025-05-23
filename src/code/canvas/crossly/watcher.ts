import { Base } from "../../base.js";
import { IRepository } from "../../repository/types.js";
import { CrosslyCanvasChangeEvent, ICrosslyCanvasObserver } from "../types.js";

export class CrosslyCanvasWatcher extends Base {
    private readonly observer: ICrosslyCanvasObserver;
    private readonly repository: IRepository;

    constructor(observer: ICrosslyCanvasObserver, repository: IRepository) {
        super(CrosslyCanvasWatcher.name);

        this.observer = observer;
        this.repository = repository;

        this.subscribe();
    }

    private async handleChange(event: CrosslyCanvasChangeEvent): Promise<void> {
        this.ensureAlive();

        const canvasData = event.pattern;
        const id = await this.repository.save(canvasData);
        console.log(`${canvasData.name} has been saved, id: ${id}`); // TODO: delete
    }

    private subscribe(): void {
        const changeUn = this.observer.onChange(this.handleChange.bind(this));
        super.registerUn(changeUn);
    }
}