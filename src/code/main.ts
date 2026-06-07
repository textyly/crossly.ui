import { Menus } from "./menu/menus.js";
import { Dialogs } from "./dialog/dialog.js";
import { MenuCanvasHandler } from "./handlers/menuCanvas.js";
import { MenuDialogHandler } from "./handlers/menuDialog.js";
import { RepositoryFactory } from "./repository/factory.js";
import { CrosslyCanvasAnimationFactory } from "./animation/factory.js";
import { CrosslyCanvasFacadeFactory } from "./canvas/crossly/factory.js";
import { Converter } from "./data-model/converter.js";
import { BackendFactory } from "./backend/factory.js";

const canvasFactory = new CrosslyCanvasFacadeFactory();
const canvas = canvasFactory.create(document);
canvas.draw();

// TODO: delete everything below !!! It is used for testing purpose only
const w = window as any;
w.crosslyCanvas = canvas;
w.crosslyCanvasFactory = canvasFactory;

const menus = new Menus(document);
const menuCanvasHandler = new MenuCanvasHandler(menus, canvas);
w.menuCanvasHandler = menuCanvasHandler;

const dialogs = new Dialogs(document);
const menuDialogHandler = new MenuDialogHandler(menus, dialogs);
w.menuDialogHandler = menuDialogHandler;

const repositoryFactory = new RepositoryFactory();
const repository = repositoryFactory.create();
w.crosslyRepository = repository;

const animationFactory = new CrosslyCanvasAnimationFactory();
w.crosslyAnimationFactory = animationFactory;

const converter = new Converter();
w.crosslyConverter = converter;

// Backend (new microservices approach): establish an anonymous guest session,
// then load this client's preferences. Runs asynchronously so it never blocks
// rendering, and fails soft if the backend isn't running.
const backendFactory = new BackendFactory();
const backend = backendFactory.create(window);
w.crosslyBackend = backend;

backend.auth.ensureSession()
    .then(() => backend.preferences.get())
    .then((preferences) => {
        w.crosslyPreferences = preferences;
        console.log("crossly: session ready", { clientId: backend.auth.getClientId(), preferences });
    })
    .catch((error) => console.error("crossly: backend init failed", error));