import axios from 'axios';

const domain = process.env.REACT_APP_DOMAIN;
const APIPath = process.env.REACT_APP_APIPATH;

export const getThumbnailURL = (item) => {
  if (item===null || typeof item.resources==="undefined" || item.resources.length===0) {
    return null;
  }
  let thumbnailResource = item.resources.filter((item)=>{return (item.term.label==="hasRepresentationObject")});
  let thumbnailPath = null;
  if (typeof thumbnailResource[0]!=="undefined") {
    if (typeof thumbnailResource[0].ref.paths!=="undefined") {

      let thumbnailPaths = thumbnailResource[0].ref.paths;
      if (typeof thumbnailResource[0].ref.paths[0]==="string") {
        thumbnailPaths = thumbnailResource[0].ref.paths.map(path=>JSON.parse(path));
        if (typeof thumbnailPaths[0]==="string") {
          thumbnailPaths = thumbnailPaths.map(path=>JSON.parse(path));
        }
      }
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
  if (resource===null || typeof resource.paths==="undefined" || resource.paths===null || resource.paths.length===0) {
    return null;
  }
  if(typeof resource.paths[0].path==="undefined") {
    let parsedPaths = resource.paths.map(path=>{
      let newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
  }
  let thumbnail = resource.paths.filter((item)=>{return (item.pathType==="thumbnail")});
  let thumbnailPath = null;
  if (typeof thumbnail[0]!=="undefined") {
    thumbnailPath = domain+"/"+thumbnail[0].path;
  }
  return thumbnailPath;
}

export const getResourceFullsizeURL = (resource) => {
  if (resource===null || typeof resource.paths==="undefined" || resource.paths.length===0) {
    return null;
  }
  if(typeof resource.paths[0].path==="undefined") {
    let parsedPaths = resource.paths.map(path=>{
      let newPath = JSON.parse(path);
      return newPath;
    });
    resource.paths = parsedPaths;
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
        method: 'put',
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
  for (let i=0;i<refTypes.length;i++) {
    let option = refTypes[i];
    let label = option.term.label;
    if (options.indexOf(label)<0) {
      options.push({value: label, label: label});
    }
  };
  return options;
}

export const parseReferenceLabels = (properties) => {
  let referenceLabels = [];
  for (let i=0;i<properties.length; i++) {
    let property = properties[i];
    if (referenceLabels.indexOf(property.entityRef.label)===-1) {
      referenceLabels.push(property.entityRef.label);
    }
  }
  return referenceLabels;
}

export const parseReferenceTypes = (properties) => {
  let referenceTypesEvent = [];
  let referenceTypesOrganisation = [];
  let referenceTypesPerson = [];
  let referenceTypesResource = [];
  let referenceTypesTemporal = [];
  let referenceTypesSpatial = [];
  for (let i=0;i<properties.length; i++) {
    let property = properties[i];
    if (property.entityRef.label==="Event") {
      referenceTypesEvent.push(property);
    }
    if (property.entityRef.label==="Organisation") {
      referenceTypesOrganisation.push(property);
    }
    if (property.entityRef.label==="Person") {
      referenceTypesPerson.push(property);
    }
    if (property.entityRef.label==="Resource") {
      referenceTypesResource.push(property);
    }
    if (property.entityRef.label==="Temporal") {
      referenceTypesTemporal.push(property);
    }
    if (property.entityRef.label==="Spatial") {
      referenceTypesSpatial.push(property);
    }
  }
  let referenceTypes = {
    event: referenceTypesEvent,
    organisation: referenceTypesOrganisation,
    person: referenceTypesPerson,
    resource: referenceTypesResource,
    temporal: referenceTypesTemporal,
    spatial: referenceTypesSpatial,
  }
  return referenceTypes;
}

export const stringDimensionToInteger = (dimension) => {
  if (typeof dimension==="string") {
    dimension = dimension.replace("px", "");
    dimension = parseInt(dimension,10);
  }
  return dimension;
}

export const capitalizeOnlyFirst = (str) => {
  if (typeof str!=='string') {
    return str;
  }
  let firstLetter = str.charAt(0).toUpperCase();
  let restOfString = lowerCaseStr(str.slice(1));
  return  firstLetter+restOfString;
}

const lowerCaseStr = (str) => {
  let chars = str.split("");
  let lowerChars = chars.map((c,i)=> {
    let outputChar = c;
    if (i===0) {
      outputChar = c.toLowerCase();
    }
    if (i>0) {
      let prevIndex = i-1;
      let prevChar = chars[prevIndex];
      let regexp = /[\\^'" .]/g
      if (!prevChar.match(regexp)) {
        outputChar = c.toLowerCase();
      }
    }
    return outputChar;
  });
  let output = lowerChars.join("");
  return output;
}

export const jsonStringToObject = (data) => {
  let output = null;
  if (typeof data==="string") {
    output = JSON.parse(data);
  }
  return output;
}
