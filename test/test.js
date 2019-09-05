import {applyMiddleware, createStore} from "redux";
import {commandMiddleware, enhanceCommandReducer} from "../dist";

function initReducer() {
    return {
        name: "yuankui",
        age: 30,
    }
}

const store = createStore(enhanceCommandReducer(initReducer), applyMiddleware(commandMiddleware));

