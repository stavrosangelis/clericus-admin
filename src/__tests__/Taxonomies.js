/* globals afterAll, afterEach, beforeAll, describe, expect, it */
import React from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import store from '../redux/store';
import server from '../__mocks__/mock-server';

import Taxonomies from '../views/Taxonomies';

function Wrapper() {
  return (
    <Provider store={store()}>
      <Router>
        <Taxonomies />
      </Router>
    </Provider>
  );
}

// Enable API mocking before tests.
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Disable API mocking after the tests are done.
afterAll(() => server.close());

describe('Render the Taxonomies data view', () => {
  it('renders without error', async () => {
    render(<Wrapper />);
    await waitFor(() =>
      screen.findByRole('heading', { level: 2, name: 'Taxonomies' })
    );
  });

  it('renders taxonomies buttons', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.findByRole('button', { name: 'Event types' }));
  });

  it('renders taxonomy list items', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.findByText('Appointment'));
  });

  it('renders taxonomy label input and correctly adds the value', async () => {
    const { container } = render(<Wrapper />);

    await waitFor(() => {
      const input = container.querySelector('#labelInput');
      expect(input.value).toBe('Event types');
    });
  });

  it('renders taxonomy description textarea and correctly adds the value', async () => {
    const { container } = render(<Wrapper />);

    await waitFor(() => {
      const input = container.querySelector('#descriptionInput');
      expect(input.value).toBe(
        'The Event types taxonomy contains a list of all the possible event types'
      );
    });
  });

  it('click taxonomy save button and trigger error', async () => {
    render(<Wrapper />);

    await waitFor(() => screen.findByText('Appointment'));

    await waitFor(() => {
      screen.getByLabelText('Save taxonomy');
    });

    const btn = screen.getByLabelText('Save taxonomy');
    fireEvent.click(btn);

    await waitFor(() => {
      screen.getByText(`The record "Event types" cannot be updated`);
    });
    expect(
      screen.getByText(`The record "Event types" cannot be updated`)
    ).toBeInTheDocument();
  });

  it('click taxonomy delete button to open delete modal, click delete, click cancel', async () => {
    render(<Wrapper />);

    await waitFor(() => screen.findByText('Appointment'));

    await waitFor(() => {
      screen.getByLabelText('Delete taxonomy');
    });

    const btn = screen.getByLabelText('Delete taxonomy');
    fireEvent.click(btn);

    await waitFor(() => {
      screen.getByText(`Delete "Event types"`);
    });
    expect(screen.getByText(`Delete "Event types"`)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Delete modal submit'));

    await waitFor(() => {
      screen.getByText(
        `You must remove the record's relations before deleting`
      );
    });
    expect(
      screen.getByText(`You must remove the record's relations before deleting`)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Delete modal cancel'));

    await waitForElementToBeRemoved(() =>
      screen.queryByLabelText('Delete modal cancel')
    );
  });
});

describe('Test Taxonomy terms', () => {
  it('renders taxonomy terms items', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.findByText('Appointment'));
  });

  it('click on term to open term modal', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.findByText('Appointment'));

    const btn = screen.getAllByLabelText('open taxonomy term modal')[0];
    fireEvent.click(btn);

    await waitFor(() => {
      screen.getByText(`Edit term "Appointment"`);
    });
    expect(screen.getByText(`Edit term "Appointment"`)).toBeInTheDocument();
  });

  it('renders term modal, correctly adds the input values and clicks save', async () => {
    render(<Wrapper />);
    await waitFor(() => screen.findByText('Appointment'));

    const btn = screen.getAllByLabelText('open taxonomy term modal')[0];
    fireEvent.click(btn);

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Term label...');
      expect(input.value).toBe('Appointment');
    });

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Term inverse label...');
      expect(input.value).toBe('Appointment');
    });

    await waitFor(() => {
      screen.getByLabelText('Save taxonomy term');
    });

    const saveBtn = screen.getByLabelText('Save taxonomy term');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByLabelText('Save taxonomy term')).toHaveTextContent(
        'Save success'
      );
    });
  });
});
