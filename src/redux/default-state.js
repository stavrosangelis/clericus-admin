const defaultState = {
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
    limit: 25,
    activeType: null,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  peoplePagination: {
    limit: 25,
    peopleType: null,
    page: 1,
    orderField: 'firstName',
    orderDesc: false,
    status: null,
    searchInput: '',
    advancedSearchInputs: [],
  },
  organisationsPagination: {
    limit: 25,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    activeType: null,
    status: null,
    searchInput: '',
  },
  eventsPagination: {
    limit: 25,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    activeType: null,
    status: null,
    searchInput: '',
  },
  temporalsPagination: {
    limit: 25,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  spatialsPagination: {
    limit: 25,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  usersPagination: {
    limit: 25,
    page: 1,
    orderField: 'firstName',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  usergroupsPagination: {
    limit: 25,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  articlesPagination: {
    limit: 25,
    page: 1,
    activeType: null,
    orderField: 'label',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  slideshowPagination: {
    limit: 25,
    page: 1,
    orderField: 'order',
    orderDesc: false,
    status: null,
    searchInput: '',
  },
  contactFormsPagination: {
    limit: 25,
    page: 1,
    orderField: 'createdAt',
    orderDesc: true,
    searchInput: '',
  },
  queryBuilderPagination: {
    limit: 25,
    activeType: null,
    page: 1,
    orderField: 'label',
    orderDesc: false,
    status: null,
    total_pages: null,
  },
  userGroups: [],

  resourcesTypes: [],
  personTypes: [],
  organisationTypes: [],
  eventTypes: [],

  lightBoxOpen: false,
  lightBoxSrc: null,

  peopleRoles: [],

  // entities properties
  entitiesLoaded: false,
  eventEntity: null,
  organisationEntity: null,
  personEntity: null,
  resourceEntity: null,
  temporalEntity: null,
  spatialEntity: null,

  // query builder
  queryBlockOpen: true,
  queryBlocksMain: [],
  queryBlocksEvent: [],
  queryBlocksOrganisation: [],
  queryBlocksResource: [],
  queryBlocksPerson: [],
  queryBlocksSpatial: [],
  queryBlocksTemporal: [],
  queryBuilderSubmit: false,
  queryBuilderSearching: false,
  queryBuildType: 'Event',
  queryBuildResults: [],
  clearQueryBuildResults: false,
};

module.exports = {
  defaultState,
};