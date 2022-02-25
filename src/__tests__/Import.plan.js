import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks/mock-server';

import ImportPlan from '../views/tools/Import.Plan';

const defaultProps = {
  match: {
    params: {
      _id: '321335',
    },
  },
};

const Wrapper = (props) => (
  <Provider store={store()}>
    <Router>
      {/* eslint-disable-next-line */}
      <ImportPlan {...defaultProps} {...props} />
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

// patch undefined scroll function by mocking it
window.HTMLElement.prototype.scroll = jest.fn();

// tests
describe('Render the import data view', () => {
  it('renders without error', async () => {
    await act(async () => {
      render(<Wrapper />);

      await screen.findByText('Upload new file');
    });
  });

  it('render columns', async () => {
    await act(async () => {
      render(<Wrapper />);

      await screen.findByText('File Columns');
    });
  });

  it('render data cleaning', async () => {
    await act(async () => {
      render(<Wrapper />);

      await screen.findByText('data cleaning instance');
    });
  });

  it('render import plan rules', async () => {
    await act(async () => {
      render(<Wrapper />);

      await screen.findByText('Main person/Entry');
    });
  });

  /* it('loaded item', async () => {
    await act(async () => {
      render(<Wrapper />);
      await waitFor(() => screen.findAllByText('1911 Census'));
    });
  }); */
});
