const express = require("express");
const cors = require("cors");
const routes = require("./src/routes");
require("./src/services/NotificationService"); // Initialize Observers

class Server {
    constructor() {
        this.app = express();
        this.port = 5001;
        this.setupMiddlewares();
        this.setupRoutes();
    }

    setupMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    setupRoutes() {
        this.app.use("/", routes);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`✅ CareChain Backend (OOP) Live: http://localhost:${this.port}`);
        });
    }
}

const server = new Server();
server.start();