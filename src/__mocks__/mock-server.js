import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { articlesData, articlesCategoriesData } from './articles.data';
import importPlansData from './import-plans.data';
import {
  importPlan,
  importPlanRules,
  dataCleaningInstance,
} from './import-plan.data';
import {
  taxonomiesData,
  taxonomyData,
  taxonomyDelete,
  taxonomyPut,
  taxonomyTerm,
  taxonomyTermPut,
} from './taxonomies.data';

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
  rest.get('http://localhost:5100/api/article-categories', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(articlesCategoriesData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/import-plans', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(importPlansData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/import-plan', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(importPlan), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/import-plan-rules', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(importPlanRules), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/data-cleaning', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(dataCleaningInstance), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/taxonomies', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomiesData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/taxonomy', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomyData), ctx.delay(150))
  ),
  rest.put('http://localhost:5100/api/taxonomy', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomyPut), ctx.delay(150))
  ),
  rest.delete('http://localhost:5100/api/taxonomy', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomyDelete), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/taxonomy-term', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomyTerm), ctx.delay(150))
  ),
  rest.put('http://localhost:5100/api/taxonomy-term', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(taxonomyTermPut), ctx.delay(150))
  ),
];

const server = setupServer(...handlers);
export default server;
