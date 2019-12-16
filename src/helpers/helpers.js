import axios from 'axios';
import React from 'react';
import { Link } from 'react-router-dom';

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
  if (resource===null || typeof resource.paths==="undefined" || resource.paths===null) {
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
  }
  let referenceTypes = {
    event: referenceTypesEvent,
    organisation: referenceTypesOrganisation,
    person: referenceTypesPerson,
    resource: referenceTypesResource,
  }
  return referenceTypes;
}

export const loadRelatedEvents = (item=null, deleteRef) => {
  if (item===null || item.length===0 || typeof item.events==="undefined") {
    return [];
  }
  let references = item.events;
  let output = [];
  for (let i=0;i<references.length; i++) {
    let reference = references[i];
    if (reference.ref!==null) {
      let label = reference.ref.label;
      let newRow = <div key={i} className="ref-item">
        <Link to={"/event/"+reference.ref._id} href={"/event/"+reference.ref._id}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(reference.ref._id, reference.term.label, "Event")}><i className="fa fa-times" /></div>
      </div>
      output.push(newRow);
    }
  }
  return output;
}

export const loadRelatedOrganisations = (item=null, deleteRef) => {
  if (item===null || item.length===0 || typeof item.organisations==="undefined") {
    return [];
  }
  let references = item.organisations;
  let output = [];
  for (let i=0;i<references.length; i++) {
    let reference = references[i];
    if (reference.ref!==null) {
      let label = reference.ref.label;

      let newRow = <div key={i} className="ref-item">
        <Link to={"/organisation/"+reference.ref._id} href={"/organisation/"+reference.ref._id}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(reference.ref._id, reference.term.label, "Organisation")}><i className="fa fa-times" /></div>
      </div>
      output.push(newRow);
    }
  }
  return output;
}

export const loadRelatedPeople = (item=null, deleteRef) => {
  if (item===null || item.length===0 || typeof item.people==="undefined") {
    return [];
  }
  let references = item.people;
  let output = references.filter(r=>r.ref!==null).map((reference, i)=>{
    let label = reference.ref.firstName;
    if (reference.ref.lastName!=="") {
      label+= " "+reference.ref.lastName
    }
    let role = [];
    if (typeof reference.term.role!=="undefined" && reference.term.role!=="null") {
      role = <label>as {reference.term.roleLabel}</label>
    }
    let newRow = <div key={i} className="ref-item">
      <Link to={"/person/"+reference.ref._id} href={"/person/"+reference.ref._id}>
        <i>{reference.term.label}</i> <b>{label}</b> {role}
      </Link>
      <div className="delete-ref" onClick={()=>deleteRef(reference.ref._id, reference.term.label, "Person")}><i className="fa fa-times" /></div>
    </div>
    return newRow;
  });
  return output;
}

export const loadRelatedResources = (item=null, deleteRef) => {
  if (item===null || item.length===0 || typeof item.resources==="undefined") {
    return [];
  }
  let references = item.resources;
  let output = references.filter(r=>r.ref!==null).map((reference, i)=>{
    let thumbnailPath = getResourceThumbnailURL(reference.ref);
    let thumbnailImage = [];
    if (thumbnailPath!==null) {
      thumbnailImage = <img src={thumbnailPath} alt={reference.label} className="img-fluid"/>
    }
    let role = [];
    if (typeof reference.term.role!=="undefined" && reference.term.role!=="null") {
      role = <label>as {reference.term.roleLabel}</label>
    }
    let newRow = <div key={i} className="img-thumbnail related-resource">
        <Link to={"/resource/"+reference.ref._id} href={"/resource/"+reference.ref._id}>
          <i>{reference.term.label}</i>
          {thumbnailImage}
          <label>{reference.ref.label}</label>
          {role}
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(reference.ref._id, reference.term.label, "Resource")}><i className="fa fa-times" /></div>
      </div>
    return newRow;
  });
  return output;
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
