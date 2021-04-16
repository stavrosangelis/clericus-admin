import axios from 'axios';

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
        payload.loginErrorText = responseData.error;
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
