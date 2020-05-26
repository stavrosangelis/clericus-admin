import {
  GENERIC_UPDATE,
} from "../constants/action-types";

import axios from 'axios';

const APIPath = process.env.REACT_APP_APIPATH;

export function loadSettings() {
  return (dispatch,getState) => {
    axios({
      method: 'get',
      url: APIPath+'settings',
      crossDomain: true,
    })
    .then(function (response) {
      let responseData = response.data;
      let payload = {};
      if (responseData.status) {
        let settings = responseData.data;
        payload = {
          settings: settings
        };
        if (typeof settings.seedingAllowed!=="undefined" && settings.seedingAllowed) {
          payload.seedRedirect = true;
        }
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });

    })
    .catch(function (error) {
      console.log(error)
    });

  }
}

export function checkSession() {
  return (dispatch,getState) => {
    let token = localStorage.getItem('token');
    axios({
      method: 'post',
      url: APIPath+'admin-session',
      crossDomain: true,
      data: {token: token},
    })
    .then(function (response) {
      let responseData = response.data;
      let payload = {};
      if (!responseData.status) {
        localStorage.setItem('token', null);
        payload = {
          sessionActive: false,
          sessionUser: null
        };
        if (responseData.error!=="") {
          payload.loginError = true;
          payload.loginErrorText = responseData.error;
        }
      }
      else {
        payload = {
          sessionActive: true,
        };
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });

    })
    .catch(function (error) {
      console.log(error)
    });

  }
}

export function login(email, password) {
  return (dispatch,getState) => {
    let postData = {
      email: email,
      password: password
    }
    axios({
      method: 'post',
      url: APIPath+'admin-login',
      crossDomain: true,
      data: postData
    })
    .then( async function (response) {
      let responseData = response.data;
      let payload = {};
      if (responseData.status) {
        await new Promise(resolve=> {
          resolve(localStorage.setItem('token', responseData.data.token));
        });
        await new Promise(resolve=> {
          resolve(localStorage.setItem('user', JSON.stringify(responseData.data)));
        });
        axios.defaults.headers.common['Authorization'] = 'Bearer '+responseData.data.token;
        payload = {
          loginError: false,
          loginErrorText: '',
          sessionActive: true,
          sessionUser: responseData.data,
          loginRedirect: true
        };
      }
      else {
        payload = {
          loginError: true,
          loginErrorText: responseData.error,
          sessionActive: false,
          sessionUser: null
        };
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });

    })
    .catch(function (error) {
      console.log(error)
    });
  }
}

export function resetSeedRedirect() {
  return (dispatch,getState) => {
    dispatch({
      type: GENERIC_UPDATE,
      payload: {seedRedirect: false}
    });
  }
}

export function resetLoginRedirect() {
  return (dispatch,getState) => {
    dispatch({
      type: GENERIC_UPDATE,
      payload: {loginRedirect: false}
    });
  }
}

export function logout() {
  return async(dispatch,getState) => {
    await new Promise(resolve=> {
      resolve(localStorage.setItem('token', null))
    });
    await new Promise(resolve=> {
      resolve(localStorage.setItem('user', null))
    });
    let payload = {
      sessionActive: false,
      sessionUser: null
    };
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function getLanguageCodes() {
  return (dispatch,getState) => {
    axios({
      method: 'get',
      url: APIPath+'language-codes',
      crossDomain: true,
    })
    .then(function (response) {
      let responseData = response.data;
      let payload = {};
      if (responseData.status) {
        payload = {
          languageCodes: responseData.data
        };
      }
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });
    })
    .catch(function (error) {
      console.log(error)
    });

  }
}

export function setPaginationParams(type,params) {
  return (dispatch,getState) => {
    let payload = null;
    if (type==="resources") {
      payload = {
        resourcesPagination: {
          limit:params.limit,
          activeSystemType:params.activeSystemType,
          page:params.page,
          status:params.status,
        }
      };
    }
    else if(type==="people"){
      payload = {
        peoplePagination: {
          limit:params.limit,
          page:params.page,
          orderField:params.orderField,
          orderDesc:params.orderDesc,
          status:params.status,
        }
      };
    }
    else {
      let field = `${type}Pagination`;
      payload = {
        [field]: {
          limit:params.limit,
          page:params.page,
          orderField:params.orderField,
          orderDesc:params.orderDesc,
          activeType: params.activeType,
          status:params.status,
        }
      };
    }
    if (payload===null) {
      return false;
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function getSystemTypes() {
  return (dispatch,getState) => {
    let params = {
      systemType: "resourceSystemTypes",
      flat: true
    }
    axios({
      method: 'get',
      url: APIPath+'taxonomy',
      crossDomain: true,
      params: params,
    })
    .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        let resourcesTypes = responseData.data.taxonomyterms;
        let payload ={
          resourcesTypes: resourcesTypes,
        };
        dispatch({
          type: GENERIC_UPDATE,
          payload: payload
        });
      }
      else {
        return false;
      }
    })
    .catch(function (error) {
      console.log(error)
    });

  }
}

export function getPeopleRoles() {
  return (dispatch,getState) => {
    let params = {
      systemType: "peopleRoles"
    }
    axios({
      method: 'get',
      url: APIPath+'taxonomy',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        let payload ={
          peopleRoles: responseData.data.taxonomyterms,
        };
        dispatch({
          type: GENERIC_UPDATE,
          payload: payload
        });
      }
	  })
	  .catch(function (error) {
      console.log(error)
	  });
  }
}

export function getOrganisationTypes() {
  return async (dispatch,getState) => {
    let params = {
      systemType: "organisationTypes"
    }
    let responseData = await axios({
      method: 'get',
      url: APIPath+'taxonomy',
      crossDomain: true,
      params: params,
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    if (responseData.status) {
      let organisationTypes = responseData.data.taxonomyterms;
      let payload ={
        organisationTypes: organisationTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });
    }
    else {
      return false;
    }

  }
}

export function getEventTypes() {
  return async (dispatch,getState) => {
    let params = {
      systemType: "eventTypes"
    }
    let responseData = await axios({
      method: 'get',
      url: APIPath+'taxonomy',
      crossDomain: true,
      params: params,
    })
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error)
    });
    if (responseData.status) {
      let eventTypes = responseData.data.taxonomyterms;
      let payload ={
        eventTypes: eventTypes,
      };
      dispatch({
        type: GENERIC_UPDATE,
        payload: payload
      });
    }
    else {
      return false;
    }

  }
}

export function loadDefaultEntities() {
  return async(dispatch,getState) => {
    let eventEntity = await loadEntityProperties("Event");
    let organisationEntity = await loadEntityProperties("Organisation");
    let personEntity = await loadEntityProperties("Person");
    let resourceEntity = await loadEntityProperties("Resource");
    let temporalEntity = await loadEntityProperties("Temporal");
    let spatialEntity = await loadEntityProperties("Spatial");
    let payload = {
      entitiesLoaded: true,
      eventEntity: eventEntity,
      organisationEntity: organisationEntity,
      personEntity: personEntity,
      resourceEntity: resourceEntity,
      temporalEntity: temporalEntity,
      spatialEntity: spatialEntity,
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

const loadEntityProperties = async(label)=>{
  let params = {labelId: label}
  let entity = await axios({
      method: 'get',
      url: APIPath+'entity',
      crossDomain: true,
      params: params
    })
  .then(function (response) {
    return response.data.data;

  })
  .catch((error)=> {
    console.log(error);
  });
  return entity;
}

export function toggleLightBox(value) {
  return (dispatch,getState) => {
    let payload = {
      lightBoxOpen: value
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function setLightBoxSrc(src) {
  return (dispatch,getState) => {
    let payload = {
      lightBoxSrc: src
    }
    dispatch({
      type: GENERIC_UPDATE,
      payload: payload
    });
  }
}

export function loadUsergroups() {
  return (dispatch,getState) => {
    axios({
      method: 'get',
      url: APIPath+'user-groups',
      crossDomain: true,
    })
	  .then(function (response) {
      let responseData = response.data;
      if (responseData.status) {
        let payload ={
          userGroups: responseData.data.data,
        };
        dispatch({
          type: GENERIC_UPDATE,
          payload: payload
        });
      }
	  })
	  .catch(function (error) {
      console.log(error)
	  });
  }
}
