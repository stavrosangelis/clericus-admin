import {_toogleToolBox} from "../constants/action-types";

const toggleToolBox = (payload) => {
  return { type: _toogleToolBox, payload }
};

export default toggleToolBox;
