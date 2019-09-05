# Redux-Commands
Use Redux with Commands

## Installation 
```sh
npm install redux-commands --save
yarn add redux-commands
```

## Usage

### Basic Usage

```typescript
import {applyMiddleware, createStore} from "redux";
import {Command, commandMiddleware, enhanceCommandReducer, Mapper} from "redux-commands";

class GrownOldCommand extends Command<any> {
    by: number;

    constructor(by: number) {
        super();
        this.by = by;
    }

    name(): string {
        return "my-command";
    }

    process(state: any): any {
        return {
            ...state,
            age: state.age + this.by,
        }
    }
}

function initReducer() {
    return {
        name: "yuankui",
        age: 30,
    };
}

let store = createStore(enhanceCommandReducer(initReducer), applyMiddleware(commandMiddleware));
console.log("init state");
console.log(store.getState());
// output:
//    { name: 'yuankui', age: 30 }

console.log("dispatch new GrownOldCommand(3)");
store.dispatch(new GrownOldCommand(3));

console.log("current state");
console.log(store.getState());
// output:
//    { name: 'yuankui', age: 33 }
```
