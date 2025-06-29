import { ICrosslyCanvasFacade } from "../types.js";
import { ConfigFactory } from "../../config/factory.js";
import { CrosslyCanvasFacadeBuilder } from "./facadeBuilder.js";

export class CrosslyCanvasFacadeFactory {

    public create(document: Document): ICrosslyCanvasFacade {
        const configFactory = new ConfigFactory();
        const config = configFactory.create();

        const canvasBuilder = new CrosslyCanvasFacadeBuilder(document);
        canvasBuilder.withConfig(config);

        const canvasFacade = canvasBuilder.build();
        return canvasFacade;
    }
}