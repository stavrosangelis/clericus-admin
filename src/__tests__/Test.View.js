import React from 'react';
import {
  act,
  render,
  screen,
  cleanup,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react';
import server from '../__mocks/mock-server';
import TestView from '../views/test-view';

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('Test component', () => {
  it('loads data', async () => {
    await act(async () => {
      render(<TestView />);

      screen.getByText('Loading...');
    });
  });

  it('removes text "Loading..."', async () => {
    await act(async () => {
      render(<TestView />);

      await waitForElementToBeRemoved(() => screen.getByText('Loading...'));
    });
  });

  it('displays articles', async () => {
    await act(async () => {
      render(<TestView />);
      await waitFor(() => screen.getByText('St. Patrick’s College Maynooth'));
    });
  });
});
