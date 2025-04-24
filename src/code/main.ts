import { CanvasBuilder } from "./builder.js";
import { ConfigFactory } from "./config/factory.js";
import { CrosslyCanvasObserver } from "./canvas/crossly/observer.js";
import { CrosslySerializer } from "./repository/serialization/serializer.js";

const canvasBuilder = new CanvasBuilder();

const configFactory = new ConfigFactory();
const config = configFactory.create();
canvasBuilder.withConfig(config);

const canvasFacade = canvasBuilder.build();
canvasFacade.draw();

// Delete !!!
(window as any).crossly = canvasFacade;

// const serializer = new CrosslySerializer();
// const observer = new CrosslyCanvasObserver(canvasFacade);
// observer.onChange((event) => {
//     const canvasData = event.data;
//     const dataModel = serializer.serialize(canvasData);
//     console.log(dataModel);
// });

