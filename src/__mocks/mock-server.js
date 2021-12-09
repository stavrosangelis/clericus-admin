import { rest } from 'msw';
import { setupServer } from 'msw/node';

const articlesData = {
  status: true,
  data: {
    currentPage: 1,
    data: [
      {
        label: ' St. Patrick’s College Maynooth',
        _id: '15120',
      },
    ],
    totalItems: 50,
    totalPages: 2,
  },
  error: [],
  msg: 'Query results',
};

const importPlans = {
  status: true,
  data: {
    currentPage: 1,
    data: [
      {
        columnsParsed: true,
        createdAt: '2021-09-24T15:36:29.517Z',
        updatedBy: '53930',
        createdBy: '53930',
        columns: [
          '﻿DB ID',
          'Surname',
          'Alternate Surname',
          'First name',
          'First name Alternate',
          'First name Alternate Language',
          'Additional alternate first name',
          'Additional alternate language',
          'Diocese',
          'Diocese DB ID',
          'Native Place',
          'DB ID Native Place',
          'Native P alternate appellation',
          'Location Type',
          'Location Diocese',
          'DOB',
          'Birth Location',
          'Birth Location Type',
          'Birth Diocese',
          'DOD',
          'Death Location',
          'Death Location Type',
          'Death Diocese',
          'Father Surname',
          'Father First name',
          'Mother Alternate Surname (maiden name)',
          'Mother First name',
          'University',
          'Location of University',
          'Residence',
          'Residence Type',
          'Location of Residence',
          'Date of Residence',
          'Ordination',
          'Ordination Date',
          'Matriculation Date',
          'Program of Study 1',
          'Registration Date',
          'Masters of Art',
          'Program of Study 2',
          'Date of Award 2',
          'Program of Study 3',
          'Date of Award 3',
          'Program of Study 4',
          'Date of Award 4',
          'Program of Study 5',
          'Date of Award 5',
          'Other College',
          'Other College Location',
          'Program of Study Other',
          'Award Other',
          'Dates of Attendance/Award',
          'Other College 2',
          'Other College 2 Location',
          'Dates of Attendance Other 2',
          'Municipal College',
          'Dates of study Mun',
          'Bursary/Scholarship',
          'Scholarship Awarded Date',
          'Scholarship Location',
          'Minor Orders taken',
          'Minor Orders Date',
          'Minor Orders Location',
          'Minor Orders Location Type',
          'Service as PP',
          'Date',
          'PP Diocese',
          'Was Member of (Event)',
          'Date of Membership',
          'Location 2',
          'Was member of (Organisation)',
          'Was serving as (Event)',
          'Date of Service',
          'Organisation',
          'Organisation Type 2',
          'Location 3',
          'Additional Info (manual entry)',
          'Resource',
        ],
        _id: '93912',
        label: 'Paris Toulouse',
        uploadedFile: '93955',
        updatedAt: '2021-09-27T14:15:24.800Z',
        systemLabels: ['Import'],
      },
    ],
    totalItems: '3',
    totalPages: 1,
  },
  error: [],
  msg: 'Query results',
};

const handlers = [
  rest.post('http://localhost:5100/api/admin-login', (req, res, ctx) => {
    const { email, password } = req.body;
    const adminData = {
      status: false,
      data: [],
      error: 'Please provide a valid email address',
      msg: '',
    };
    if (email === 'test@test.com' && password === 'test123') {
      adminData.data = {
        _id: '444',
        firstName: 'Test',
        lastName: 'Test',
        email: 'test@test.com',
        usergroup: {
          description: 'This group has access to the back-end',
          isDefault: false,
          isAdmin: true,
          label: 'Administrator',
          _id: '33',
        },
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZXIiOiJDbGVyaWN1cyBhcHAiLCJlbWFpbCI6InN0YXZyb3MuYW5nZWxpc0BtdS5pZSIsImlkIjoiNTM5MzAiLCJleHBpcmVzSW4iOiIyMDIxLTExLTExVDExOjA1OjQ4LjI3NFoiLCJhbGdvcml0aG0iOiJSUzI1NiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTYzNjU0MjM0OH0.igd4yGK10iaGNQitGlRtlaBCV9T-2IYGIBG468fUwjE',
      };
      adminData.status = true;
      adminData.error = '';
    }
    return res(ctx.status(200), ctx.json(adminData), ctx.delay(150));
  }),
  rest.get('http://localhost:5100/api/articles', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(articlesData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/imports', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(importPlans), ctx.delay(150))
  ),
];

const server = setupServer(...handlers);
export default server;
