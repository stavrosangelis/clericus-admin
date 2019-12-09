import {createStore, applyMiddleware} from "redux";
import rootReducer from "./reducers/index";
import thunk from 'redux-thunk';

export const defaultState = {
  // settings
  settings: {},
  seedRedirect: false,

  // languageCodes
  languageCodes: [],

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
  eventsPagination: {
    limit:25,
    page:1
  },
  usersPagination: {
    limit:25,
    page:1
  },
  usergroupsPagination: {
    limit:25,
    page:1
  },
  userGroups: [],

  systemTypes: [],
  lightBoxOpen: false,
  lightBoxSrc: null,

  peopleRoles: [],

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
