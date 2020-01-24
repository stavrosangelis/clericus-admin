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
    activeType:null,
    page:1,
    status: null,
  },
  peoplePagination: {
    limit:25,
    page:1,
    orderField: "firstName",
    orderDesc: false,
    status: null,
  },
  organisationsPagination: {
    limit:25,
    page:1,
    orderField: "label",
    orderDesc: false,
    activeType: null,
    status: null,
  },
  eventsPagination: {
    limit:25,
    page:1,
    orderField: "label",
    orderDesc: false,
    activeType: null,
    status: null,
  },
  temporalsPagination: {
    limit:25,
    page:1,
    orderField: "label",
    orderDesc: false,
    status: null,
  },
  spatialsPagination: {
    limit:25,
    page:1,
    orderField: "label",
    orderDesc: false,
    status: null,
  },
  usersPagination: {
    limit:25,
    page:1,
    orderField: "firstName",
    orderDesc: false,
    status: null,
  },
  usergroupsPagination: {
    limit:25,
    page:1,
    orderField: "label",
    orderDesc: false,
    status: null,
  },
  userGroups: [],

  resourcesTypes: [],
  organisationTypes: [],
  eventTypes: [],

  lightBoxOpen: false,
  lightBoxSrc: null,

  peopleRoles: [],

  // entities properties
  entitiesLoaded:false,
  eventEntity: null,
  organisationEntity: null,
  personEntity: null,
  resourceEntity: null,
  temporalEntity: null,
  spatialEntity: null,
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
