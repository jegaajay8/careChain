const EventEmitter = require("events");

class EventBus extends EventEmitter {
    constructor() {
        super();
        if (!EventBus.instance) {
            EventBus.instance = this;
        }
        return EventBus.instance;
    }
}

module.exports = new EventBus();
