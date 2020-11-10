import {
  GENERIC_UPDATE,
} from "../constants/action-types";
import {defaultState} from "../store";

function rootReducer(state = defaultState, action) {
  if (action.type === GENERIC_UPDATE) {
    return Object.assign({}, state, action.payload);
  }
  return state;
}
export default rootReducer;
