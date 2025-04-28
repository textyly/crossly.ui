import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";
import { CrosslyDataModelConverter } from "./repository/converter.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvasFacade = canvasBuilder.build();
canvasFacade.draw();

// Delete !!!
(window as any).crossly = canvasFacade;

// const converter = new CrosslyDataModelConverter();
// const observer = new CrosslyCanvasObserver(canvasFacade);
// observer.onChange((event) => {
//     const canvasData = event.data;
//     const dataModel = converter.convertToDataModel(canvasData);
//     console.log(dataModel);
// });

