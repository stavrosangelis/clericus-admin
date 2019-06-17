import {createStore, applyMiddleware} from "redux";
import rootReducer from "./reducers/index";
import thunk from 'redux-thunk';

export const defaultState = {
  // login
  loginError: false,
  loginErrorText: [],
  sessionActive: false,
  sessionUser: null,
  loginRedirect: false,

  resourcesPagination: {
    limit:25,
    activeSystemType:null,
    page:1,
  },
  peoplePagination: {
    limit:25,
    page:1
  },
  organisationsPagination: {
    limit:25,
    page:1
  },
  eventsPagination: {},
  systemTypes: [],
  lightBoxOpen: false,
  lightBoxSrc: null,

  // entities properties
  entitiesLoaded:false,
  eventEntity: null,
  organisationEntity: null,
  personEntity: null,
  resourceEntity: null,


}

function configureStore(state = defaultState) {
  const store = createStore(
    rootReducer,
    state,
    applyMiddleware(thunk),
  );
  return store;
}
export default configureStore;
