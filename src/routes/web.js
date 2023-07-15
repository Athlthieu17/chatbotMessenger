import express from "express";
import chatbotControllers  from "../controllers/chatbotControllers";
let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", chatbotControllers.getHomePage)

    router.get("/webhook", chatbotControllers.getWebhook);
    router.post("/webhook", chatbotControllers.postWebhook);
    
    return app.use("/", router);
};

module.exports = initWebRoutes;