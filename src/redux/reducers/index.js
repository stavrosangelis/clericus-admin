import {
  GENERIC_UPDATE,
} from "../constants/action-types";
import {defaultState} from "../store";

const initialState = defaultState;

function rootReducer(state = initialState, action) {
  if (action.type === GENERIC_UPDATE) {
    return Object.assign({}, state, action.payload);
  }
  return state;
}
export default rootReducer;
