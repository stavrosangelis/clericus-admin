import React from 'react';
import {
  act,
  cleanup,
  render,
  screen,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';
import ImportPlans from '../views/tools/Import.Plans';

const defaultProps = {
  limit: 25,
  page: 1,
  orderField: 'label',
  orderDesc: false,
  searchInput: '',
};

const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      {/* eslint-disable-next-line */}
      <ImportPlans {...defaultProps} {...props} />
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

describe('Render the import data view', () => {
  it('renders without error', async () => {
    await act(async () => {
      render(<Wrapper />);

      screen.getByText('Import Data Plans');
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
      await waitFor(() => screen.getByText('Paris Toulouse'));
    });
  });
});
