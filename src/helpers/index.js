import React from 'react';
import { Spinner } from 'reactstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const domain = process.env.REACT_APP_DOMAIN;
const APIPath = process.env.REACT_APP_APIPATH;

export const jsonStringToObject = (data) => {
  let output = null;
  if (typeof data === 'string') {
    output = JSON.parse(data);
  }
  if (typeof output === 'string') {
    output = jsonStringToObject(output);
  }
  return output;
};

export const getThumbnailURL = (item) => {
  if (
    item === null ||
    typeof item.resources === 'undefined' ||
    item.resources.length === 0
  ) {
    return null;
  }
  const thumbnailResource = item.resources.filter(
    (i) => i.term.label === 'hasRepresentationObject'
  );
  let thumbnailPath = null;
  if (typeof thumbnailResource[0] !== 'undefined') {
    if (typeof thumbnailResource[0].ref.paths !== 'undefined') {
      let thumbnailPaths = thumbnailResource[0].ref.paths;
      if (typeof thumbnailResource[0].ref.paths[0] === 'string') {
        thumbnailPaths = thumbnailResource[0].ref.paths.map((path) =>
          JSON.parse(path)
        );
        if (typeof thumbnailPaths[0] === 'string') {
          thumbnailPaths = thumbnailPaths.map((path) => JSON.parse(path));
        }
      }
      const thumbnailPathFilter = thumbnailPaths.filter(
        (i) => i.pathType === 'thumbnail'
      );
      thumbnailPath = `${domain}/${thumbnailPathFilter[0].path}`;
    }
  }
  return thumbnailPath;
};

export const getPersonThumbnailURL = (person) => {
  if (
    person === null ||
    typeof person.resources === 'undefined' ||
    person.resources.length === 0
  ) {
    return [];
  }
  const thumbnailResources = person.resources.filter(
    (item) => item.term.label === 'hasRepresentationObject'
  );
  const thumbnailPaths = [];
  const fullsizePaths = [];

  if (typeof thumbnailResources !== 'undefined') {
    for (let i = 0; i < thumbnailResources.length; i += 1) {
      const t = thumbnailResources[i];
      if (typeof t.ref.paths !== 'undefined') {
        const { paths } = t.ref;
        for (let j = 0; j < paths.length; j += 1) {
          let path = paths[j];
          if (typeof path === 'string') {
            path = jsonStringToObject(path);
          }
          if (path.pathType === 'thumbnail') {
            const newPath = `${domain}/${path.path}`;
            thumbnailPaths.push(newPath);
          }
          if (path.pathType === 'source') {
            const newPath = `${domain}/${path.path}`;
            fullsizePaths.push(newPath);
          }
        }
      }
    }
  }
  return { thumbnails: thumbnailPaths, fullsize: fullsizePaths };
};

export const getPersonLabel = (person) => {
  let label = '';
  if (typeof person.firstName !== 'undefined' && person.firstName !== '') {
    label = person.firstName;
  }
  if (typeof person.lastName !== 'undefined' && person.lastName !== '') {
    label += ` ${person.lastName}`;
  }
  return label;
};

export const getResourceThumbnailURL = (resource) => {
  if (
    resource === null ||
    typeof resource.paths === 'undefined' ||
    resource.paths === null ||
    resource.paths.length === 0
  ) {
    return null;
  }
  let parsedPaths = [];
  if (typeof resource.paths[0] === 'string') {
    for (let i = 0; i < resource.paths.length; i += 1) {
      const p = resource.paths[i];
      const parsedPath = jsonStringToObject(p);
      parsedPaths.push(parsedPath);
    }
  }
  if (typeof resource.paths[0] === 'object') {
    parsedPaths = resource.paths;
  }
  const thumbnail =
    parsedPaths.find((item) => item.pathType === 'thumbnail') || null;
  let thumbnailPath = null;
  if (thumbnail !== null) {
    thumbnailPath = `${domain}/${thumbnail.path}`;
  }
  return thumbnailPath;
};

export const getResourceFullsizeURL = (resource) => {
  if (
    resource === null ||
    typeof resource.paths === 'undefined' ||
    resource.paths === null ||
    resource.paths.length === 0
  ) {
    return null;
  }
  let parsedPaths = [];
  if (typeof resource.paths[0] === 'string') {
    for (let i = 0; i < resource.paths.length; i += 1) {
      const p = resource.paths[i];
      const parsedPath = jsonStringToObject(p);
      parsedPaths.push(parsedPath);
    }
  }
  if (typeof resource.paths[0] === 'object') {
    parsedPaths = resource.paths;
  }
  const thumbnail = parsedPaths.filter((item) => item.pathType === 'source');
  let thumbnailPath = null;
  if (typeof thumbnail[0] !== 'undefined') {
    thumbnailPath = `${domain}/${thumbnail[0].path}`;
  }
  return thumbnailPath;
};

export const getOrganisationThumbnailURL = (organisation) => {
  if (
    organisation === null ||
    typeof organisation.resources === 'undefined' ||
    organisation.resources === null ||
    organisation.resources.length === 0
  ) {
    return null;
  }
  const thumbnailResource = organisation.resources.filter(
    (item) => item.refLabel === 'hasRepresentationObject'
  );
  let thumbnailPath = null;
  if (typeof thumbnailResource[0] !== 'undefined') {
    if (typeof thumbnailResource[0].ref.paths !== 'undefined') {
      const thumbnailPaths = thumbnailResource[0].ref.paths;
      const thumbnailPathFilter = thumbnailPaths.filter(
        (item) => item.pathType === 'thumbnail'
      );
      thumbnailPath = `${domain}/${thumbnailPathFilter[0].path}`;
    }
  }
  return thumbnailPath;
};

export const getEventThumbnailURL = (item) => {
  if (item === null || typeof item.paths === 'undefined') {
    return null;
  }
  const thumbnail = item.paths.filter((i) => i.pathType === 'thumbnail');
  let thumbnailPath = null;
  if (typeof thumbnail[0] !== 'undefined') {
    thumbnailPath = `${domain}/${thumbnail[0].path}`;
  }
  return thumbnailPath;
};

export const addGenericReference = (reference) =>
  new Promise((resolve) => {
    axios({
      method: 'put',
      url: `${APIPath}reference`,
      crossDomain: true,
      data: reference,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log(error);
      });
  });

export const refTypesList = (refTypes) => {
  const options = [];
  for (let i = 0; i < refTypes.length; i += 1) {
    const option = refTypes[i];
    const { label } = option.term;
    if (options.indexOf(label) < 0) {
      options.push({ value: label, label });
    }
  }
  return options;
};

export const parseReferenceLabels = (properties) => {
  const referenceLabels = [];
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    if (referenceLabels.indexOf(property.entityRef.label) === -1) {
      referenceLabels.push(property.entityRef.label);
    }
  }
  return referenceLabels;
};

export const parseReferenceTypes = (properties) => {
  const referenceTypesEvent = [];
  const referenceTypesOrganisation = [];
  const referenceTypesPerson = [];
  const referenceTypesResource = [];
  const referenceTypesTemporal = [];
  const referenceTypesSpatial = [];
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    if (property.entityRef.label === 'Event') {
      referenceTypesEvent.push(property);
    }
    if (property.entityRef.label === 'Organisation') {
      referenceTypesOrganisation.push(property);
    }
    if (property.entityRef.label === 'Person') {
      referenceTypesPerson.push(property);
    }
    if (property.entityRef.label === 'Resource') {
      referenceTypesResource.push(property);
    }
    if (property.entityRef.label === 'Temporal') {
      referenceTypesTemporal.push(property);
    }
    if (property.entityRef.label === 'Spatial') {
      referenceTypesSpatial.push(property);
    }
  }
  const referenceTypes = {
    event: referenceTypesEvent,
    organisation: referenceTypesOrganisation,
    person: referenceTypesPerson,
    resource: referenceTypesResource,
    temporal: referenceTypesTemporal,
    spatial: referenceTypesSpatial,
  };
  return referenceTypes;
};

export const stringDimensionToInteger = (dimension) => {
  let dimensionCopy = dimension;
  if (typeof dimensionCopy === 'string') {
    dimensionCopy = dimensionCopy.replace('px', '');
    dimensionCopy = parseInt(dimensionCopy, 10);
  }
  return dimensionCopy;
};

const lowerCaseStr = (str) => {
  const chars = str.split('');
  const lowerChars = chars.map((c, i) => {
    let outputChar = c;
    if (i === 0) {
      outputChar = c.toLowerCase();
    }
    if (i > 0) {
      const prevIndex = i - 1;
      const prevChar = chars[prevIndex];
      const regexp = /[\\^'" .]/g;
      if (!prevChar.match(regexp)) {
        outputChar = c.toLowerCase();
      }
    }
    return outputChar;
  });
  const output = lowerChars.join('');
  return output;
};

export const capitalizeOnlyFirst = (str) => {
  if (typeof str !== 'string') {
    return str;
  }
  const firstLetter = str.charAt(0).toUpperCase();
  const restOfString = lowerCaseStr(str.slice(1));
  return firstLetter + restOfString;
};

export const outputDate = (dateParam, sep = '/') => {
  let date = dateParam;
  if (date instanceof Date === false) {
    date = new Date(date);
  }
  let d = date.getDate();
  if (d < 10) {
    d = `0${d}`;
  }
  let m = date.getMonth() + 1;
  if (m < 10) {
    m = `0${m}`;
  }
  const y = date.getFullYear();
  return `${d}${sep}${m}${sep}${y}`;
};

export const queryDate = (dateParam) => {
  let date = dateParam;
  if (date instanceof Date === false) {
    date = new Date(date);
  }
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
};

export const renderLoader = () => (
  <div style={{ padding: '40pt', textAlign: 'center' }}>
    <Spinner type="grow" color="info" />
  </div>
);

export const getData = async (urlParam = '', params = null) => {
  if (urlParam === '') {
    return [];
  }
  const url = `${APIPath}${urlParam}`;
  const parameters = {
    method: 'get',
    url,
    crossDomain: true,
  };
  if (params !== null) {
    parameters.params = params;
  }
  const responseData = await axios(parameters)
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);
    });
  return responseData;
};

export const putData = async (urlParam = '', params = null) => {
  if (urlParam === '') {
    return [];
  }
  const url = `${APIPath}${urlParam}`;
  const parameters = {
    method: 'put',
    url,
    crossDomain: true,
  };
  if (params !== null) {
    parameters.data = params;
  }
  const responseData = await axios(parameters)
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);
    });
  return responseData;
};

export const deleteData = async (urlParam = '', params = null) => {
  if (urlParam === '') {
    return [];
  }
  const url = `${APIPath}${urlParam}`;
  const parameters = {
    method: 'delete',
    url,
    crossDomain: true,
  };
  if (params !== null) {
    parameters.data = params;
  }
  const responseData = await axios(parameters)
    .then((response) => response.data)
    .catch((error) => {
      console.log(error);
    });
  return responseData;
};

const isUpperCase = (c) => {
  const result = c === c.toUpperCase();
  return result;
};

export const outputRelationTypes = (str) => {
  let newString = '';
  for (let i = 0; i < str.length; i += 1) {
    const c = str[i];
    const upperCase = isUpperCase(c);
    if (upperCase) {
      newString += ` ${c.toLowerCase()}`;
    } else {
      newString += c;
    }
  }
  return newString;
};

export const personLabel = (item) => {
  let label = '';
  if (
    typeof item.honorificPrefix !== 'undefined' &&
    item.honorificPrefix !== ''
  ) {
    label += `${item.honorificPrefix} `;
  }
  if (typeof item.firstName !== 'undefined' && item.firstName !== '') {
    label += `${item.firstName} `;
  }
  if (typeof item.middleName !== 'undefined' && item.middleName !== '') {
    label += `${item.middleName} `;
  }
  if (typeof item.lastName !== 'undefined' && item.lastName !== '') {
    label += `${item.lastName} `;
  }
  return label;
};

export const eventLabelDetails = (item) => {
  const temporal =
    typeof item.temporal !== 'undefined'
      ? item.temporal.map((t) => t.ref.label).join(', ')
      : '';
  const spatial =
    typeof item.spatial !== 'undefined'
      ? item.spatial.map((s) => s.ref.label).join(', ')
      : '';
  let label = '';
  if (temporal !== '') {
    label += temporal;
    if (spatial !== '') {
      label += ' | ';
    }
  }
  if (spatial !== '') {
    label += spatial;
  }
  return label;
};

export const eventBlock = (item) => {
  const { _id, label } = item.ref;
  const labelDetails = eventLabelDetails(item);
  const url = `event/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          {label}
          {labelDetails}
        </span>
      </Link>
    </li>
  );
};

export const organisationBlock = (item) => {
  const { _id, label } = item.ref;
  const termLabel = outputRelationTypes(item.term.label);
  const url = `organisation/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          <i>{termLabel}</i> {label}
        </span>
      </Link>
    </li>
  );
};

export const peopleBlock = (item) => {
  const { _id } = item.ref;
  const label = personLabel(item.ref);
  const termLabel = outputRelationTypes(item.term.label);
  const url = `person/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          <i>{termLabel}</i> {label}
        </span>
      </Link>
    </li>
  );
};

export const resourcesBlock = (item) => {
  const { _id, label } = item.ref;
  const termLabel = outputRelationTypes(item.term.label);
  const url = `resource/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          <i>{termLabel}</i> {label}
        </span>
      </Link>
    </li>
  );
};

export const spatialBlock = (item) => {
  const { _id, label } = item.ref;
  const termLabel = outputRelationTypes(item.term.label);
  const url = `spatial/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          <i>{termLabel}</i> {label}
        </span>
      </Link>
    </li>
  );
};

export const temporalBlock = (item) => {
  const { _id, label } = item.ref;
  const termLabel = outputRelationTypes(item.term.label);
  const url = `temporal/${_id}`;
  return (
    <li key={_id}>
      <Link href={url} to={url} target="_blank">
        <span className="tag-bg tag-item">
          <i>{termLabel}</i> {label}
        </span>
      </Link>
    </li>
  );
};
