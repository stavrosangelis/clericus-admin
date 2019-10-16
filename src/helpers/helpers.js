import axios from 'axios';

const domain = process.env.REACT_APP_DOMAIN;
const APIPath = process.env.REACT_APP_APIPATH;

export const getPersonThumbnailURL = (person) => {
  if (person===null || typeof person.resources==="undefined" || person.resources.length===0) {
    return null;
  }
  let thumbnailResource = person.resources.filter((item)=>{return (item.refLabel==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
}

export const getPersonLabel = (person) => {
  let label = "";
  if (typeof person.firstName!=="undefined" && person.firstName!=="") {
    label = person.firstName;
  }
  if (typeof person.lastName!=="undefined" && person.lastName!=="") {
    label += " "+person.lastName;
  }
  return label;
}

export const getResourceThumbnailURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined") {
    return null;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="thumbnail")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getResourceFullsizeURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined") {
    return null;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="source")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getOrganisationThumbnailURL = (organisation) => {
  if (organisation===null || typeof organisation.resources==="undefined" || organisation.resources===null || organisation.resources.length===0) {
    return null;
  }
  let thumbnailResource = organisation.resources.filter((item)=>{return (item.refLabel==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      let thumbnailPathFilter = thumbnailPaths.filter((item)=>{return (item.pathType==="thumbnail")});
      thumbnailPath = domain+"/"+thumbnailPathFilter[0].path;
    }
  }
  return thumbnailPath;
}

export const getEventThumbnailURL = (item) => {
  if (item===null || typeof item.paths==="undefined") {
    return null;
  }
  let thumbnail = item.paths.filter((item)=>{return (item.pathType==="thumbnail")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const addGenericReference = (reference) => {
  return new Promise((resolve, reject) => {
    axios({
        method: 'post',
        url: APIPath+'reference',
        crossDomain: true,
        data: reference
      })
    .then(function (response) {
      resolve (response);
    })
    .catch(function (error) {
    });
  });
}

export const refTypesList = (refTypes) => {
  let options = [];
  let _ids = [];
  for (let i=0;i<refTypes.length;i++) {
    let option = refTypes[i];
    let label = option.term.label;
    if (option.direction==="to") {
      label = option.term.inverseLabel;
    }
    if (_ids.indexOf(option.term._id)<0) {
      options.push({value: option.term._id, label: label});
    }
    _ids.push(option.term._id);
  };
  return options;
}

export const parseReferenceLabels = (properties) => {
  let referenceLabels = [];
  for (let i=0;i<properties.length; i++) {
    let property = properties[i];
    if (referenceLabels.indexOf(property.entityRef.labelId===-1)) {
      referenceLabels.push(property.entityRef.labelId);
    }
  }
  return referenceLabels;
}

export const parseReferenceTypes = (properties) => {
  let referenceTypesEvent = [];
  let referenceTypesOrganisation = [];
  let referenceTypesPerson = [];
  let referenceTypesResource = [];
  for (let i=0;i<properties.length; i++) {
    let property = properties[i];
    if (property.entityRef.labelId==="Event") {
      referenceTypesEvent.push(property);
    }
    if (property.entityRef.labelId==="Organisation") {
      referenceTypesOrganisation.push(property);
    }
    if (property.entityRef.labelId==="Person") {
      referenceTypesPerson.push(property);
    }
    if (property.entityRef.labelId==="Resource") {
      referenceTypesResource.push(property);
    }
  }
  let referenceTypes = {
    event: referenceTypesEvent,
    organisation: referenceTypesOrganisation,
    person: referenceTypesPerson,
    resource: referenceTypesResource,
  }
  return referenceTypes;
}
