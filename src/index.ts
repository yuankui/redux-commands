import {Action, Dispatch, Middleware, MiddlewareAPI, Reducer} from "redux";

const CommandActionName = "Command";
const CommandPromiseActionName = CommandActionName + ":promise";

function commandActionName(name: string) {
    return `${CommandActionName}:${name}`;
}

function commandPromiseActionName(name: string) {
    return `${CommandPromiseActionName}:${name}`;
}


export const commandMiddleware: Middleware = api => dispatch => action => {
    // 1. if action is not command, return early.
    if (!(action instanceof Command)) {
        return;
    }

    // 2. extra, for view in the redux dev tool
    let extra: any = null;
    if (action.json != null) {
        try {
            extra = action.json();
        } catch (e) {
            extra = e.toString();
        }
    }

    // 3. mock a MiddlewareAPI for child
    const middlewareAPI: MiddlewareAPI<any> = {
        getState(): any {
            return api.getState();
        },
        dispatch(a: Command<any>): any {
            a.parent = {
                command: action.type,
                extra: extra,
            };
            return api.dispatch(a);
        }
    }

    // 4. call the process, and check the result.
    let result: any = action.process(middlewareAPI);

    // 4.1 if result is a promise
    if (Promise.resolve(result) === result) {
        // wait and dispatch the result.
        return result.then((res: any) => {
            if (res != null) {
                dispatch({
                    type: commandPromiseActionName(action.type),
                    parent: action.parent,
                    extra,
                    mapper: res,
                });
            }

        })
    } else if (result instanceof Function) {
        // 4.2 if result is a mapper
        dispatch({
            type: commandActionName(action.type),
            mapper: result,
            parent: action.parent,
            extra,
        });

        return action;
    }

};

export interface Mapper<T> {
    (input: T): T
}

export function emptyMapper<T>(input: T) {
    return input;
}

export interface MapperAction<S> extends Action<string> {
    parent: any,
    extra: any,
    mapper: Mapper<S>,
}

export abstract class Command<S> implements Action {
    parent: any = null;

    /**
     * S: return a updated status
     *
     * Promise<void>: not update status immediately, bug dispatch use param: dispatch
     *              when promise resolves, indicates the job has done.
     */
    abstract process(store: MiddlewareAPI<Dispatch, S>): Mapper<S> | Promise<Mapper<S>> | Promise<void> | void;

    json?(): object;

    get type(): string {
        return this.constructor.name;
    }
}

export function commandReducer<S>(reducer?: Reducer<S, any>) {
    return function (state: S | undefined, a: any): S {
        // if not command, return early.
        if (!a.type.startsWith(CommandActionName)) {
            if (reducer)
                return reducer(state, a);
            else return state as any;
        }

        // mapper action
        const action: MapperAction<S> = a;

        return action.mapper(state as any);
    }
}
