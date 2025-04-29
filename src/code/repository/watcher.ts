import { Base } from "../base.js";
import { RepositoryClient } from "./client.js";
import { CrosslyDataModelValidator } from "./validator.js";
import { CrosslyDataModelConverter } from "./converter.js";
import { CrosslyDataModelSerializer } from "./serializer.js";
import { ChangeEvent, ICrosslyCanvasObserver } from "../canvas/types.js";
import {
    IRepositoryClient,
    ICrosslyDataModelConverter,
    ICrosslyDataModelValidator,
    ICrosslyDataModelSerializer,
} from "./types.js";


export class CrosslyCanvasWatcher extends Base {
    private readonly observer: ICrosslyCanvasObserver;
    private readonly validator: ICrosslyDataModelValidator;
    private readonly converter: ICrosslyDataModelConverter;
    private readonly serializer: ICrosslyDataModelSerializer;
    private readonly repository: IRepositoryClient;

    constructor(observer: ICrosslyCanvasObserver) {
        super(CrosslyCanvasWatcher.name);

        this.observer = observer;

        this.validator = new CrosslyDataModelValidator();
        this.converter = new CrosslyDataModelConverter();
        this.serializer = new CrosslyDataModelSerializer();
        this.repository = new RepositoryClient();

        this.subscribe();
    }

    private async handleChange(event: ChangeEvent): Promise<void> {
        this.ensureAlive();

        // TODO: must be done in a queue so that save requests are ordered
        const canvasData = event.data;
        const dataModel = this.converter.convertToDataModel(canvasData);
        console.log(dataModel); // delete

        this.validator.validateDataModel(dataModel);

        const compressedDataModel = await this.serializer.compressToGzip(dataModel);

        this.repository.save(compressedDataModel);

    }

    private subscribe(): void {
        const changeUn = this.observer.onChange(this.handleChange.bind(this));
        super.registerUn(changeUn);
    }
}