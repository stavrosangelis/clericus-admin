export const taxonomiesData = {
  status: true,
  data: {
    currentPage: 1,
    data: [
      {
        systemType: 'eventTypes',
        description:
          'The Event types taxonomy contains a list of all the possible event types',
        label: 'Event types',
        labelId: 'EventTypes',
        locked: true,
        _id: '373',
        systemLabels: ['Taxonomy'],
      },
      {
        createdAt: '2020-06-12T10:55:47.333Z',
        updatedBy: '432',
        labelId: 'MatriculationClass',
        createdBy: '432',
        systemType: 'matriculationClass',
        description: '',
        label: 'Matriculation class',
        locked: false,
        updatedAt: '2020-06-12T10:55:47.333Z',
        _id: '9792',
        systemLabels: ['Taxonomy'],
      },
      {
        createdAt: '2020-06-18T16:21:32.302Z',
        updatedBy: '432',
        labelId: 'OrdinationRanks',
        createdBy: '432',
        systemType: 'ordinationRanks',
        description: '',
        label: 'Ordination ranks',
        locked: false,
        updatedAt: '2020-06-18T16:21:32.302Z',
        _id: '21836',
        systemLabels: ['Taxonomy'],
      },
      {
        systemType: 'organisationTypes',
        description: '',
        label: 'Organisation types',
        labelId: 'OrganisationTypes',
        locked: true,
        _id: '554',
        systemLabels: ['Taxonomy'],
      },
      {
        systemType: 'peopleRoles',
        description: '',
        label: 'People roles',
        labelId: 'PeopleRoles',
        locked: true,
        _id: '392',
        systemLabels: ['Taxonomy'],
      },
      {
        createdAt: '2020-11-24T12:04:31.181Z',
        updatedBy: '432',
        labelId: 'PersonTypes',
        createdBy: '432',
        systemType: 'personTypes',
        description: '',
        label: 'Person types',
        locked: false,
        updatedAt: '2020-11-24T12:04:31.181Z',
        _id: '59252',
        systemLabels: ['Taxonomy'],
      },
      {
        systemType: 'relationsTypes',
        description:
          'The Relations types taxonomy contains the possible relations between the data model entities e.g. [entity]Resource [relation]depicts [entity]Person.',
        label: 'Relations types',
        labelId: 'RelationsTypes',
        locked: true,
        _id: '593',
        systemLabels: ['Taxonomy'],
      },
      {
        systemType: 'resourceSystemTypes',
        description: '',
        label: 'Resource system types',
        labelId: 'ResourceSystemTypes',
        locked: true,
        _id: '306',
        systemLabels: ['Taxonomy'],
      },
      {
        createdAt: '2021-09-08T08:28:37.144Z',
        updatedBy: '53930',
        labelId: 'ServiceRanks',
        createdBy: '53930',
        systemType: 'serviceRanks',
        description: '',
        label: 'Service ranks',
        locked: false,
        updatedAt: '2021-09-08T08:28:37.144Z',
        _id: '87140',
        systemLabels: ['Taxonomy'],
      },
      {
        systemType: 'userGroups',
        description: 'The available user groups relations to users',
        label: 'User groups',
        labelId: 'UserGroups',
        locked: true,
        _id: '720',
        systemLabels: ['Taxonomy'],
      },
    ],
    totalItems: '10',
    totalPages: 1,
  },
  error: [],
  msg: 'Query results',
};

export const taxonomyData = {
  status: true,
  data: {
    _id: '373',
    label: 'Event types',
    labelId: 'EventTypes',
    locked: true,
    description:
      'The Event types taxonomy contains a list of all the possible event types',
    systemType: 'eventTypes',
    createdBy: null,
    createdAt: null,
    updatedBy: null,
    updatedAt: null,
    taxonomyterms: [
      {
        inverseLabel: 'Appointment',
        inverseLabelId: 'Appointment',
        updatedBy: '532',
        count: '0',
        label: 'Appointment',
        createdAt: '2020-04-03T13:21:56.052Z',
        labelId: 'Appointment',
        createdBy: '532',
        _id: '16049',
        relations: [],
        locked: false,
        scopeNote: '',
        updatedAt: '2020-04-03T13:21:56.052Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Attendance',
        inverseLabelId: 'Attendance',
        updatedBy: '53930',
        count: '0',
        label: 'Attendance',
        createdAt: '2021-07-20T13:36:56.489Z',
        labelId: 'Attendance',
        createdBy: '532',
        _id: '86525',
        locked: false,
        scopeNote: '',
        updatedAt: '2022-03-09T19:08:40.452Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Birth',
        createdAt: '2020-11-08T16:19:49.493Z',
        inverseLabelId: 'Birth',
        updatedBy: '532',
        labelId: 'Birth',
        createdBy: '532',
        count: 0,
        label: 'Birth',
        locked: false,
        updatedAt: '2020-11-08T16:19:49.493Z',
        _id: '59249',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Burial',
        inverseLabelId: 'Burial',
        updatedBy: '532',
        count: '0',
        label: 'Burial',
        parentRef: '2250',
        createdAt: '2020-11-08T15:35:15.240Z',
        labelId: 'Burial',
        createdBy: '532',
        _id: '59248',
        relations: [],
        locked: false,
        updatedAt: '2020-11-08T15:35:15.240Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Bursary/Scholarship',
        inverseLabelId: 'BursaryScholarship',
        updatedBy: '532',
        count: '0',
        label: 'Bursary/Scholarship',
        createdAt: '2020-11-08T15:10:14.700Z',
        labelId: 'BursaryScholarship',
        createdBy: '532',
        _id: '59241',
        relations: [],
        locked: false,
        updatedAt: '2020-11-08T15:10:14.700Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Compilation',
        createdAt: '2020-06-25T13:56:28.934Z',
        inverseLabelId: 'Compilation',
        updatedBy: '432',
        labelId: 'Compilation',
        createdBy: '432',
        count: 0,
        label: 'Compilation',
        locked: false,
        updatedAt: '2020-06-25T13:56:28.934Z',
        _id: '35050',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Death',
        createdAt: '2020-10-16T10:31:09.831Z',
        inverseLabelId: 'Death',
        updatedBy: '53930',
        labelId: 'Death',
        createdBy: '53930',
        count: 0,
        label: 'Death',
        locked: false,
        updatedAt: '2020-10-16T10:31:09.831Z',
        _id: '2250',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Departure',
        createdAt: '2020-11-08T15:21:41.752Z',
        inverseLabelId: 'Departure',
        updatedBy: '532',
        labelId: 'Departure',
        createdBy: '532',
        count: 0,
        label: 'Departure',
        locked: false,
        updatedAt: '2020-11-08T15:21:41.752Z',
        _id: '59243',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Description',
        createdAt: '2021-01-28T11:21:43.411Z',
        inverseLabelId: 'Description',
        updatedBy: '532',
        labelId: 'Description',
        createdBy: '532',
        count: 0,
        label: 'Description',
        locked: false,
        updatedAt: '2021-01-28T11:21:43.411Z',
        _id: '72002',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Education',
        createdAt: '2021-09-03T12:08:10.704Z',
        inverseLabelId: 'Education',
        updatedBy: '53930',
        labelId: 'Education',
        createdBy: '53930',
        count: 0,
        label: 'Education',
        locked: false,
        updatedAt: '2021-09-03T12:08:10.704Z',
        _id: '87135',
        systemLabels: ['TaxonomyTerm'],
        children: [
          {
            inverseLabel: 'Bachelors',
            createdAt: '2021-09-06T13:08:59.526Z',
            inverseLabelId: 'Bachelors',
            updatedBy: '53930',
            labelId: 'Bachelors',
            createdBy: '53930',
            count: 0,
            label: 'Bachelors',
            locked: false,
            updatedAt: '2021-09-06T13:08:59.526Z',
            _id: '87137',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Doctor',
            createdAt: '2021-09-06T13:09:31.005Z',
            inverseLabelId: 'Doctor',
            updatedBy: '53930',
            labelId: 'Doctor',
            createdBy: '53930',
            count: 0,
            label: 'Doctor',
            locked: false,
            updatedAt: '2021-09-06T13:09:31.005Z',
            _id: '86597',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Doctorate',
            createdAt: '2021-09-06T13:09:22.234Z',
            inverseLabelId: 'Doctorate',
            updatedBy: '53930',
            labelId: 'Doctorate',
            createdBy: '53930',
            count: 0,
            label: 'Doctorate',
            locked: false,
            updatedAt: '2021-09-06T13:09:22.234Z',
            _id: '86596',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Enrolment',
            inverseLabelId: 'Enrolment',
            updatedBy: '532',
            count: '0',
            label: 'Enrolment',
            createdAt: '2021-08-06T10:06:10.474Z',
            labelId: 'Enrolment',
            createdBy: '532',
            _id: '86631',
            relations: [],
            locked: false,
            updatedAt: '2021-08-06T10:06:10.474Z',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Licentiate',
            createdAt: '2021-09-06T13:09:12.511Z',
            inverseLabelId: 'Licentiate',
            updatedBy: '53930',
            labelId: 'Licentiate',
            createdBy: '53930',
            count: 0,
            label: 'Licentiate',
            locked: false,
            updatedAt: '2021-09-06T13:09:12.511Z',
            _id: '86595',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Masters of Art',
            createdAt: '2021-09-06T12:54:47.044Z',
            inverseLabelId: 'MastersOfArt',
            updatedBy: '53930',
            labelId: 'MastersOfArt',
            createdBy: '53930',
            count: 0,
            label: 'Masters of Art',
            locked: false,
            updatedAt: '2021-09-06T12:54:47.044Z',
            _id: '87138',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Program of Study',
            createdAt: '2021-09-07T07:07:30.398Z',
            inverseLabelId: 'ProgramOfStudy_2',
            updatedBy: '53930',
            labelId: 'ProgramOfStudy_2',
            createdBy: '53930',
            count: 0,
            label: 'Program of Study',
            locked: false,
            updatedAt: '2021-09-07T07:07:30.398Z',
            _id: '87139',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Registration',
            createdAt: '2021-09-03T12:08:38.040Z',
            inverseLabelId: 'Registration_2',
            updatedBy: '53930',
            labelId: 'Registration_2',
            createdBy: '53930',
            count: 0,
            label: 'Registration',
            locked: false,
            updatedAt: '2021-09-03T12:08:38.040Z',
            _id: '87136',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
        ],
      },
      {
        inverseLabel: 'Exhibition',
        createdAt: '2021-09-15T18:25:25.025Z',
        inverseLabelId: 'Exhibition',
        updatedBy: '532',
        labelId: 'Exhibition',
        createdBy: '532',
        count: 0,
        label: 'Exhibition',
        locked: false,
        updatedAt: '2021-09-15T18:25:25.025Z',
        _id: '87211',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Foundation',
        createdAt: '2021-08-11T12:20:18.029Z',
        inverseLabelId: 'Foundation',
        updatedBy: '532',
        labelId: 'Foundation',
        createdBy: '532',
        count: 0,
        label: 'Foundation',
        locked: false,
        updatedAt: '2021-08-11T12:20:18.029Z',
        _id: '86885',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Habitation',
        createdAt: '2021-04-28T14:55:40.966Z',
        inverseLabelId: 'Habitation',
        updatedBy: '532',
        labelId: 'Habitation',
        createdBy: '532',
        count: 0,
        label: 'Habitation',
        locked: false,
        updatedAt: '2021-04-28T14:55:40.966Z',
        _id: '72761',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Last will and testament',
        createdAt: '2021-07-21T12:20:08.402Z',
        inverseLabelId: 'LastWillAndTestament',
        updatedBy: '532',
        labelId: 'LastWillAndTestament',
        createdBy: '532',
        count: 0,
        label: 'Last will and testament',
        locked: false,
        updatedAt: '2021-07-21T12:20:08.402Z',
        _id: '86531',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Lobbying',
        createdAt: '2021-07-20T10:34:41.601Z',
        inverseLabelId: 'Lobbying',
        updatedBy: '532',
        labelId: 'Lobbying',
        createdBy: '532',
        count: 0,
        label: 'Lobbying',
        locked: false,
        updatedAt: '2021-07-20T10:34:41.601Z',
        _id: '86515',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Masters',
        createdAt: '2021-09-07T14:31:03.454Z',
        inverseLabelId: 'Masters',
        updatedBy: '53930',
        labelId: 'Masters',
        createdBy: '53930',
        count: 0,
        label: 'Masters',
        locked: false,
        updatedAt: '2021-09-07T14:31:03.454Z',
        _id: '87146',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Membership',
        createdAt: '2021-07-07T13:59:41.821Z',
        inverseLabelId: 'Membership',
        updatedBy: '532',
        labelId: 'Membership',
        createdBy: '532',
        count: 0,
        label: 'Membership',
        locked: false,
        updatedAt: '2021-07-07T13:59:41.821Z',
        _id: '86491',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Oath',
        createdAt: '2021-10-05T12:58:13.961Z',
        inverseLabelId: 'Oath',
        updatedBy: '532',
        labelId: 'Oath',
        createdBy: '532',
        count: 0,
        label: 'Oath',
        locked: false,
        updatedAt: '2021-10-05T12:58:13.961Z',
        _id: '94257',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Program of Study',
        createdAt: '2021-07-23T09:52:29.929Z',
        inverseLabelId: 'ProgramOfStudy',
        updatedBy: '532',
        labelId: 'ProgramOfStudy',
        createdBy: '532',
        count: 0,
        label: 'Program of Study',
        locked: false,
        updatedAt: '2021-07-23T09:52:29.929Z',
        _id: '79768',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Retirement',
        createdAt: '2020-10-15T10:18:14.618Z',
        inverseLabelId: 'Retirement',
        updatedBy: '53930',
        labelId: 'Retirement',
        createdBy: '53930',
        count: 0,
        label: 'Retirement',
        locked: false,
        updatedAt: '2020-10-15T10:18:14.618Z',
        _id: '1979',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'Sacraments of Initiation',
        createdAt: '2020-11-08T15:33:40.532Z',
        inverseLabelId: 'SacramentsOfInitiation',
        updatedBy: '532',
        labelId: 'SacramentsOfInitiation',
        createdBy: '532',
        count: 0,
        label: 'Sacraments of Initiation',
        locked: false,
        updatedAt: '2020-11-08T15:33:40.532Z',
        _id: '59247',
        systemLabels: ['TaxonomyTerm'],
        children: [
          {
            inverseLabel: 'Baptism',
            inverseLabelId: 'Baptism',
            updatedBy: '532',
            count: '0',
            label: 'Baptism',
            createdAt: '2020-11-08T15:26:54.117Z',
            labelId: 'Baptism',
            createdBy: '532',
            _id: '59245',
            relations: [],
            locked: false,
            updatedAt: '2020-11-08T15:26:54.117Z',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
          {
            inverseLabel: 'Confirmation',
            inverseLabelId: 'Confirmation',
            updatedBy: '532',
            count: '0',
            label: 'Confirmation',
            createdAt: '2020-11-08T15:25:41.158Z',
            labelId: 'Confirmation',
            createdBy: '532',
            _id: '59244',
            relations: [],
            locked: false,
            updatedAt: '2020-11-08T15:25:41.158Z',
            systemLabels: ['TaxonomyTerm'],
            children: [],
          },
        ],
      },
      {
        inverseLabel: 'Travel',
        inverseLabelId: 'Travel',
        updatedBy: '53930',
        count: '0',
        label: 'Travel',
        createdAt: '2021-08-10T12:22:33.191Z',
        labelId: 'Travel',
        createdBy: '532',
        _id: '86820',
        locked: false,
        scopeNote: '',
        updatedAt: '2022-03-09T19:09:31.725Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'commission',
        createdAt: '2021-09-16T09:57:14.337Z',
        inverseLabelId: 'commission',
        updatedBy: '532',
        labelId: 'commission',
        createdBy: '532',
        count: 0,
        label: 'commission',
        locked: false,
        updatedAt: '2021-09-16T09:57:14.337Z',
        _id: '87233',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'did not complete studies',
        inverseLabelId: 'didNotCompleteStudies',
        updatedBy: '432',
        count: '0',
        label: 'did not complete studies',
        parentRef: '86490',
        createdAt: '2020-06-15T12:50:07.156Z',
        labelId: 'didNotCompleteStudies',
        createdBy: '432',
        _id: '21352',
        relations: [],
        locked: false,
        updatedAt: '2020-06-15T12:50:07.156Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'habitation',
        createdAt: '2021-05-13T10:05:17.117Z',
        inverseLabelId: 'habitation',
        updatedBy: '432',
        labelId: 'habitation',
        createdBy: '432',
        count: 0,
        label: 'habitation',
        locked: false,
        updatedAt: '2021-05-13T10:05:17.117Z',
        _id: '74396',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'matriculation',
        inverseLabelId: 'matriculation',
        updatedBy: '432',
        count: '0',
        label: 'matriculation',
        parentRef: '86490',
        createdAt: '2020-03-27T12:29:48.580Z',
        labelId: 'matriculation',
        createdBy: '432',
        _id: '12035',
        relations: [],
        locked: false,
        scopeNote: "The event of a person's matriculation",
        updatedAt: '2020-03-27T12:29:48.580Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'ordination',
        inverseLabelId: 'ordination',
        updatedBy: '432',
        labelId: 'ordination',
        count: '0',
        _id: '529',
        label: 'ordination',
        locked: false,
        updatedAt: '2020-03-27T12:19:56.857Z',
        scopeNote: "The event of a Person's ordination",
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'other',
        inverseLabelId: 'other',
        labelId: 'other',
        count: 0,
        label: 'other',
        locked: false,
        scopeNote:
          "This is a generic event that doesn't fall under any of defined category.",
        _id: '699',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'profession',
        createdAt: '2021-06-08T10:15:40.029Z',
        inverseLabelId: 'profession',
        updatedBy: '432',
        labelId: 'profession',
        createdBy: '432',
        count: 0,
        label: 'profession',
        locked: false,
        updatedAt: '2021-06-08T10:15:40.029Z',
        _id: '82726',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'sponsorship/guarantor',
        createdAt: '2021-06-08T10:15:41.886Z',
        inverseLabelId: 'sponsorshipGuarantor',
        updatedBy: '432',
        labelId: 'sponsorshipGuarantor',
        createdBy: '432',
        count: 0,
        label: 'sponsorship/guarantor',
        locked: false,
        updatedAt: '2021-06-08T10:15:41.886Z',
        _id: '82727',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
      {
        inverseLabel: 'was held by (e)',
        inverseLabelId: 'wasHeldByEvent',
        updatedBy: '532',
        count: '0',
        label: 'was serving as (e)',
        createdAt: '2020-06-03T15:09:10.546Z',
        labelId: 'wasServingAsEvent',
        createdBy: '532',
        _id: '21267',
        relations: [],
        locked: false,
        updatedAt: '2020-06-03T15:09:10.546Z',
        systemLabels: ['TaxonomyTerm'],
        children: [],
      },
    ],
  },
  error: [],
  msg: 'Query results',
};

export const taxonomyPut = {
  status: false,
  data: [],
  error: ['The record "Event types" cannot be updated'],
  msg: 'Query results',
};

export const taxonomyDelete = {
  status: false,
  data: [],
  error: true,
  msg: ["You must remove the record's relations before deleting"],
};

export const taxonomyTerm = {
  status: true,
  data: {
    _id: '16049',
    label: 'Appointment',
    labelId: 'Appointment',
    locked: false,
    inverseLabel: 'Appointment',
    inverseLabelId: 'Appointment',
    scopeNote: '',
    count: '0',
    createdBy: '532',
    createdAt: '2020-04-03T13:21:56.052Z',
    updatedBy: '532',
    updatedAt: '2020-04-03T13:21:56.052Z',
    relations: [],
    entitiesCount: 1292,
  },
  error: [],
  msg: 'Query results',
};

export const taxonomyTermPut = {
  status: true,
  data: {
    inverseLabel: 'Appointment',
    inverseLabelId: 'Appointment',
    updatedBy: '53930',
    count: '0',
    label: 'Appointment',
    createdAt: '2020-04-03T13:21:56.052Z',
    labelId: 'Appointment',
    createdBy: '532',
    _id: '16049',
    locked: false,
    updatedAt: '2022-03-14T11:04:40.294Z',
    scopeNote: '',
  },
  error: [],
  msg: 'Query results',
};
