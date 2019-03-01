import {_toogleToolBox} from "../constants/action-types";

export default function(state = null, action) {
	if (action.type===_toogleToolBox) {
		return action.payload
	}
	return state;
}
