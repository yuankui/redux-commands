import {Action, Middleware, Reducer} from "redux";

const CommandActionName = "CommandAction";
const CommandPromiseActionName = "CommandPromiseAction";

export const commandMiddleware: Middleware = api => dispatch => action => {
	if (action instanceof Command) {

		let result: any = action.process(api.getState());
		if (Promise.resolve(result) === result) {
			// if return is a promise
            const action = {
                    type: CommandPromiseActionName + ":" + action.name(),
                    mapper: mapper,
                    command: action,
                };

			(result as Promise<Mapper<any>>).then(mapper => {
				dispatch(action)
			});
			return action;
		} else {
			return dispatch({
				type: CommandActionName + ":" + action.name(),
				state: result,
				command: action,
			});
		}
	}
	return dispatch(action);
};

export interface Mapper<S> {
	(s: S): S,
}
export abstract class Command<S, C = string> implements Action<any>{
	abstract name(): C;
	process(state: S): S | Promise<Mapper<S>> {
		return state;
	}

	type = "CommandsAction";
}

export interface CommandAction<S> extends Action<string> {
	type: string,
	state: S,
	command: Command<S>,
}

export function enhanceCommandReducer<S, A extends Action<string>>(reducer: Reducer<S, A>) {
	return function (state: S |undefined, action: A): S {
		if (action.type.startsWith(CommandActionName)) {
			let a: any = action;
			return a.state;
		} else if (action.type.startsWith(CommandPromiseActionName)) {
			const a: any = action;
			const newState =  a.mapper(state);
			return newState;
		}else {
			return reducer(state, action);
		}
	}
}
