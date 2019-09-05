import {applyMiddleware, createStore} from "redux";

import {commandMiddleware, enhanceCommandReducer} from "../index";

function initReducer() {
    return {
        name: "yuankui",
        age: 30,
    };
}
let store = createStore(enhanceCommandReducer(initReducer), applyMiddleware(commandMiddleware));

console.log(store);
