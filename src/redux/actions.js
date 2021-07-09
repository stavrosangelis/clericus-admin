import axios from 'axios';
import { getData } from '../helpers';

const GENERIC_UPDATE = 'GENERIC_UPDATE';
const APIPath = process.env.REACT_APP_APIPATH;

export function loadSettings() {
  return (dispatch) => {
    axios({
      method: 'get',
      url: `${APIPath}settings`,
      crossDomain: true,
    })
      .then((response) => {
        const responseData = response.data;
        let payload = {};
        if (responseData.status) {
          const settings = responseData.data;
          payload = {
            settings,
          };
          if (
            typeof settings.seedingAllowed !== 'undefined' &&
            settings.seedingAllowed
          ) {
            payload.seedRedirect = true;
          }
        }
        dispatch({
          type: GENERIC_UPDATE,
          payload,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export function checkSession() {
  return async (dispatch) => {
    const token = await new Promise((resolve) => {
      const newToken = localStorage.getItem('token') || null;
      resolve(newToken);
    });
    const responseData = await axios({
      method: 'post',
      url: `${APIPath}admin-session`,
      crossDomain: true,
      data: { token },
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });

    let payload = {};
    if (!responseData.status) {
      await new Promise((resolve) => {
        resolve(localStorage.setItem('token', null));
      });
      payload = {
        sessionActive: false,
        sessionUser: null,
      };
      if (responseData.error !== '') {
        payload.loginError = true;
        payload.loginErrorText = responseData.msg;
      }
    } else {
      payload = {
        sessionActive: true,
      };
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function login(email, password) {
  return async (dispatch) => {
    const postData = {
      email,
      password,
    };
    const responseData = await axios({
      method: 'post',
      url: `${APIPath}admin-login`,
      crossDomain: true,
      data: postData,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    let payload = {};
    if (responseData.status) {
      await new Promise((resolve) => {
        resolve(localStorage.setItem('token', responseData.data.token));
      });
      await new Promise((resolve) => {
        resolve(
          localStorage.setItem('user', JSON.stringify(responseData.data))
        );
      });
      axios.defaults.headers.common.Authorization = `Bearer ${responseData.data.token}`;
      payload = {
        loginError: false,
        loginErrorText: '',
        sessionActive: true,
        sessionUser: responseData.data,
        loginRedirect: true,
      };
    } else {
      payload = {
        loginError: true,
        loginErrorText: responseData.error,
        sessionActive: false,
        sessionUser: null,
      };
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function resetSeedRedirect() {
  return (dispatch) => {
    dispatch({
      type: GENERIC_UPDATE,
      payload: { seedRedirect: false },
    });
  };
}

export function resetLoginRedirect() {
  return (dispatch) => {
    dispatch({
      type: GENERIC_UPDATE,
      payload: { loginRedirect: false },
    });
  };
}

export function logout() {
  return async (dispatch) => {
    await new Promise((resolve) => {
      resolve(localStorage.setItem('token', null));
    });
    await new Promise((resolve) => {
      resolve(localStorage.setItem('user', null));
    });
    const payload = {
      sessionActive: false,
      sessionUser: null,
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function getLanguageCodes() {
  return (dispatch) => {
    axios({
      method: 'get',
      url: `${APIPath}language-codes`,
      crossDomain: true,
    })
      .then((response) => {
        const responseData = response.data;
        let payload = {};
        if (responseData.status) {
          payload = {
            languageCodes: responseData.data,
          };
        }
        dispatch({
          type: GENERIC_UPDATE,
          payload,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export const loadRelationsEventsValues = (
  searchId,
  searchTemporal,
  searchItem,
  searchSpatial,
  searchEventType
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsEventsLoading: true,
    },
  });
  const temporal = searchTemporal.replace(/_/g, '.');
  const params = {
    _id: searchId,
    label: searchItem,
    temporal,
    spatial: searchSpatial,
  };
  if (
    typeof searchEventType.value !== 'undefined' &&
    searchEventType.value !== ''
  ) {
    params.eventType = searchEventType.value;
  }
  const responseData = await getData(`events`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsEvents: responseData.data.data,
      relationsEventsLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export const loadRelationsOrganisationsValues = (
  searchId = '',
  searchLabel = '',
  searchType = ''
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsOrganisationsLoading: true,
    },
  });
  const params = {
    _id: searchId,
    label: searchLabel,
  };
  if (typeof searchType.value !== 'undefined' && searchType.value !== '') {
    params.organisationType = searchType.label;
  }
  const responseData = await getData(`organisations`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsOrganisations: responseData.data.data,
      relationsOrganisationsLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export const loadRelationsPeopleValues = (
  searchId = '',
  searchLabel = '',
  searchFirstName = '',
  searchLastName = '',
  searchType = ''
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsPeopleLoading: true,
    },
  });
  const params = {
    _id: searchId,
    label: searchLabel,
    firstName: searchFirstName,
    lastName: searchLastName,
  };
  if (typeof searchType.value !== 'undefined' && searchType.value !== '') {
    params.personType = searchType.label;
  }
  const responseData = await getData(`people`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsPeople: responseData.data.data,
      relationsPeopleLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export const loadRelationsResourcesValues = (
  searchId = '',
  searchLabel = '',
  searchType = ''
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsResourcesLoading: true,
    },
  });
  const params = {
    _id: searchId,
    label: searchLabel,
    limit: 24,
  };
  if (typeof searchType.value !== 'undefined' && searchType.value !== '') {
    params.systemType = searchType.value;
  }
  const responseData = await getData(`resources`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsResources: responseData.data.data,
      relationsResourcesLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export const loadRelationsSpatialValues = (
  searchId = '',
  searchLabel = '',
  searchCountry = '',
  searchType = ''
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsSpatialLoading: true,
    },
  });
  const params = {
    _id: searchId,
    label: searchLabel,
    country: searchCountry,
    locationType: searchType,
  };
  const responseData = await getData(`spatials`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsSpatial: responseData.data.data,
      relationsSpatialLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export const loadRelationsTemporalValues = (
  searchId = '',
  searchLabel = '',
  searchStartDate = '',
  searchEndDate = ''
) => async (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: {
      relationsTemporalLoading: true,
    },
  });
  const params = {
    _id: searchId,
    label: searchLabel,
    startDate: searchStartDate,
    endDate: searchEndDate,
  };
  const responseData = await getData(`temporals`, params);
  let payload = {};
  if (responseData.status) {
    payload = {
      relationsTemporal: responseData.data.data,
      relationsTemporalLoading: false,
    };
  }
  dispatch({
    type: GENERIC_UPDATE,
    payload,
  });
};

export function setPaginationParams(type, params) {
  return (dispatch) => {
    let payload = null;
    if (type === 'resources') {
      payload = {
        resourcesPagination: {
          limit: params.limit,
          activeType: params.activeType,
          page: params.page,
          orderField: params.orderField,
          orderDesc: params.orderDesc,
          status: params.status,
          searchInput: params.searchInput,
        },
      };
    } else if (type === 'people') {
      payload = {
        peoplePagination: {
          limit: params.limit,
          peopleType: params.peopleType,
          page: params.page,
          orderField: params.orderField,
          orderDesc: params.orderDesc,
          status: params.status,
          searchInput: params.searchInput,
          advancedSearchInputs: params.advancedSearchInputs,
        },
      };
    } else if (type === 'queryBuilder') {
      payload = {
        queryBuilderPagination: {
          limit: params.limit,
          activeType: params.activeType,
          page: params.page,
          orderField: params.orderField,
          orderDesc: params.orderDesc,
          status: params.status,
        },
      };
    } else {
      const field = `${type}Pagination`;
      payload = {
        [field]: {
          limit: params.limit,
          page: params.page,
          orderField: params.orderField,
          orderDesc: params.orderDesc,
          activeType: params.activeType,
          status: params.status,
          searchInput: params.searchInput,
        },
      };
    }
    if (payload === null) {
      return false;
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });

    return false;
  };
}

export const setPaginationOrder = (type, orderField = '') => (
  dispatch,
  getState
) => {
  if (orderField === '') {
    console.log('No order field');
    return false;
  }
  const state = getState();
  const stateKey = `${type}Pagination`;
  const copyKey = state[stateKey];
  let orderDir = 'asc';
  if (copyKey.orderDir === orderDir && copyKey.orderDir === 'asc') {
    orderDir = 'desc';
  }
  const orderDesc = orderDir !== 'asc';
  copyKey.orderField = orderField;
  copyKey.orderDir = orderDir;
  copyKey.orderDesc = orderDesc;
  const payload = {
    [stateKey]: copyKey,
  };
  dispatch({
    type: 'GENERIC_UPDATE',
    payload,
  });

  return false;
};

export function getSystemTypes() {
  return async (dispatch) => {
    const params = {
      systemType: 'resourceSystemTypes',
      flat: true,
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const resourcesTypes = responseData.data.taxonomyterms;
      const payload = {
        resourcesTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload,
      });
    } else {
      return false;
    }
    return false;
  };
}

export function getPeopleRoles() {
  return (dispatch) => {
    const params = {
      systemType: 'peopleRoles',
    };
    axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => {
        const responseData = response.data;
        if (responseData.status) {
          const payload = {
            peopleRoles: responseData.data.taxonomyterms,
          };
          dispatch({
            type: GENERIC_UPDATE,
            payload,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export function getPersonTypes() {
  return async (dispatch) => {
    const params = {
      systemType: 'personTypes',
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const personTypes = responseData.data.taxonomyterms;
      const payload = {
        personTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload,
      });
    } else {
      return false;
    }
    return false;
  };
}

export function getOrganisationTypes() {
  return async (dispatch) => {
    const params = {
      systemType: 'organisationTypes',
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const organisationTypes = responseData.data.taxonomyterms;
      const payload = {
        organisationTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload,
      });
    } else {
      return false;
    }
    return false;
  };
}

export function getEventTypes() {
  return async (dispatch) => {
    const params = {
      systemType: 'eventTypes',
    };
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}taxonomy`,
      crossDomain: true,
      params,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const eventTypes = responseData.data.taxonomyterms;
      const payload = {
        eventTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload,
      });
    } else {
      return false;
    }
    return false;
  };
}

export function getArticlesCategories() {
  return async (dispatch) => {
    const responseData = await axios({
      method: 'get',
      url: `${APIPath}article-categories`,
      crossDomain: true,
    })
      .then((response) => response.data)
      .catch((error) => {
        console.log(error);
      });
    if (responseData.status) {
      const articleCategories = responseData.data;
      const payload = {
        articleCategories,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload,
      });
    } else {
      return false;
    }
    return false;
  };
}

const loadEntityProperties = async (label) => {
  const params = { labelId: label };
  const entity = await axios({
    method: 'get',
    url: `${APIPath}entity`,
    crossDomain: true,
    params,
  })
    .then((response) => response.data.data)
    .catch((error) => {
      console.log(error);
    });
  return entity;
};

export function loadDefaultEntities() {
  return async (dispatch) => {
    const eventEntity = await loadEntityProperties('Event');
    const organisationEntity = await loadEntityProperties('Organisation');
    const personEntity = await loadEntityProperties('Person');
    const resourceEntity = await loadEntityProperties('Resource');
    const temporalEntity = await loadEntityProperties('Temporal');
    const spatialEntity = await loadEntityProperties('Spatial');
    const payload = {
      entitiesLoaded: true,
      eventEntity,
      organisationEntity,
      personEntity,
      resourceEntity,
      temporalEntity,
      spatialEntity,
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function toggleLightBox(value) {
  return (dispatch) => {
    const payload = {
      lightBoxOpen: value,
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function setLightBoxSrc(src) {
  return (dispatch) => {
    const payload = {
      lightBoxSrc: src,
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload,
    });
  };
}

export function loadUsergroups() {
  return (dispatch) => {
    axios({
      method: 'get',
      url: `${APIPath}user-groups`,
      crossDomain: true,
    })
      .then((response) => {
        const responseData = response.data;
        if (responseData.status) {
          const payload = {
            userGroups: responseData.data.data,
          };
          dispatch({
            type: GENERIC_UPDATE,
            payload,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
}

export const toggleQueryBlock = () => (dispatch, getState) => {
  const open = !getState().queryBlockOpen;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBlockOpen: open },
  });
};

export const setQueryBuildType = (value) => (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBuildType: value },
  });
};

export const queryBuildMainAdd = (values) => (dispatch, getState) => {
  const state = getState();
  const queryBlocksMainCopy = Object.assign([], state.queryBlocksMain);
  queryBlocksMainCopy.push(values);
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBlocksMain: queryBlocksMainCopy },
  });
};

export const queryBuildMainUpdate = (index, values) => (dispatch, getState) => {
  const state = getState();
  const queryBlocksMainCopy = Object.assign([], state.queryBlocksMain);
  queryBlocksMainCopy[index] = values;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBlocksMain: queryBlocksMainCopy },
  });
};

export const queryBuildMainRemove = (index) => (dispatch, getState) => {
  const state = getState();
  const queryBlocksMainCopy = Object.assign([], state.queryBlocksMain);
  queryBlocksMainCopy.splice(index, 1);
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBlocksMain: queryBlocksMainCopy },
  });
};

export const queryBuildMainClear = () => (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBlocksMain: [] },
  });
};

export const setQueryBuildResults = (values = []) => (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBuildResults: values },
  });
};

export const toggleQueryBuilderSubmit = (value = null) => (
  dispatch,
  getState
) => {
  const state = getState();
  const queryBuilderSubmit = value !== null ? value : !state.queryBuilderSubmit;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBuilderSubmit },
  });
};

export const toggleQueryBuilderSearching = (value = null) => (
  dispatch,
  getState
) => {
  const state = getState();
  const queryBuilderSearching =
    value !== null ? value : !state.queryBuilderSearching;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { queryBuilderSearching },
  });
};

export const toggleClearQueryBuildResults = (value = null) => (
  dispatch,
  getState
) => {
  const state = getState();
  const clearQueryBuildResults =
    value !== null ? value : !state.clearQueryBuildResults;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { clearQueryBuildResults },
  });
};

export const queryBuildRelatedClear = (name) => (dispatch) => {
  dispatch({
    type: GENERIC_UPDATE,
    payload: { [name]: [] },
  });
};

export const queryBuildRelatedAdd = (name, values) => (dispatch, getState) => {
  const state = getState();
  const queryBlocksCopy = [...state[name]];
  queryBlocksCopy.push(values);
  dispatch({
    type: GENERIC_UPDATE,
    payload: { [name]: queryBlocksCopy },
  });
};

export const queryBuildRelatedUpdate = (name, index, values) => (
  dispatch,
  getState
) => {
  const state = getState();
  const queryBlocksCopy = [...state[name]];
  queryBlocksCopy[index] = values;
  dispatch({
    type: GENERIC_UPDATE,
    payload: { [name]: queryBlocksCopy },
  });
};

export const queryBuildRelatedRemove = (name, index) => (
  dispatch,
  getState
) => {
  const state = getState();
  const queryBlocksMainCopy = Object.assign([], state[name]);
  queryBlocksMainCopy.splice(index, 1);
  dispatch({
    type: GENERIC_UPDATE,
    payload: { [name]: queryBlocksMainCopy },
  });
};
