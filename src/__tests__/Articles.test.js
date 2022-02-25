import React from 'react';
import {
  act,
  render,
  screen,
  cleanup,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import Articles from '../views/articles';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

const defaultProps = {
  match: {
    params: {
      page: 1,
      limit: 25,
      orderField: 'label',
      orderDesc: false,
    },
  },
};
const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      {/* eslint-disable-next-line */}
      <Articles {...defaultProps} {...props} />
    </Router>
  </Provider>
);

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('Articles view', () => {
  it('renders articles view', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.getByText('Articles');
    });
  });

  it('loads data', async () => {
    await act(async () => {
      render(<Wrapper />);

      screen.getByText('loading...');
    });
  });

  it('finished loading', async () => {
    await act(async () => {
      render(<Wrapper />);

      await waitForElementToBeRemoved(() => screen.getByText('loading...'));
    });
  });

  it('displays items', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.getByText('St. Patrick’s College Maynooth'));
    });
  });
});
