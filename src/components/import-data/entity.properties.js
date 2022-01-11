export const eventProperties = [
  { label: '_id', type: '_id' },
  { label: 'label', type: 'string' },
  { label: 'description', type: 'string' },
  { label: 'eventType', type: 'number', taxonomy: true, labelId: 'EventTypes' },
  { label: 'status', type: 'string' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
export const organisationProperties = [
  { label: '_id', type: '_id' },
  { label: 'label', type: 'string' },
  { label: 'labelSoundex', type: 'string' },
  { label: 'alternateAppelations', type: 'list' },
  { label: 'description', type: 'string' },
  {
    label: 'organisationType',
    type: 'string',
    taxonomy: true,
    labelId: 'OrganisationTypes',
  },
  { label: 'status', type: 'string' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
export const personProperties = [
  { label: '_id', type: '_id' },
  { label: 'honorificPrefix', type: 'list' },
  { label: 'label', type: 'string' },
  { label: 'firstName', type: 'string' },
  { label: 'middleName', type: 'string' },
  { label: 'lastName', type: 'string' },
  {
    label: 'alternateAppelations',
    type: 'list',
    children: [
      { label: 'firstName', type: 'string' },
      { label: 'middleName', type: 'string' },
      { label: 'lastName', type: 'string' },
      { label: 'language', type: 'string' },
      { label: 'note', type: 'string' },
    ],
  },
  { label: 'description', type: 'string' },
  {
    label: 'personType',
    type: 'string',
    taxonomy: true,
    labelId: 'PersonTypes',
  },
  { label: 'status', type: 'string' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
export const resourceProperties = [
  { label: '_id', type: '_id' },
  { label: 'label', type: 'string' },
  { label: 'alternateLabels', type: 'list' },
  { label: 'description', type: 'string' },
  { label: 'fileName', type: 'string' },
  { label: 'originalLocation', type: 'string' },
  {
    label: 'resourceType',
    type: 'string',
    taxonomy: true,
    labelId: 'ResourceSystemTypes',
  },
  { label: 'status', type: 'string' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
export const spatialProperties = [
  { label: '_id', type: '_id' },
  { label: 'label', type: 'string' },
  { label: 'streetAddress', type: 'string' },
  { label: 'locality', type: 'string' },
  { label: 'region', type: 'string' },
  { label: 'postalCode', type: 'string' },
  { label: 'country', type: 'string' },
  { label: 'latitude', type: 'string' },
  { label: 'longitude', type: 'string' },
  { label: 'locationType', type: 'string' },
  { label: 'note', type: 'string' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
export const temporalProperties = [
  { label: '_id', type: '_id' },
  { label: 'label', type: 'string' },
  { label: 'startDate', type: 'date' },
  { label: 'endDate', type: 'date' },
  { label: 'dateRange (startDate - endDate)', type: 'date' },
  /* { label: 'createdBy', type: '_id' },
  { label: 'createdAt', type: 'date' },
  { label: 'updatedBy', type: '_id' },
  { label: 'updatedAt', type: 'date' }, */
];
