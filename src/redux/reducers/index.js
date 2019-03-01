import { combineReducers } from 'redux';
import ToggleToolbox from './toggle-toolbox'

const rootReducer = combineReducers({
	toogleToolbox: ToggleToolbox,
});

export default rootReducer;
