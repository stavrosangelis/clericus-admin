import React from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import store from '../redux/store';
import server from '../__mocks/mock-server';
import Login from '../views/login';

const defaultProps = {
  loginError: false,
  loginErrorText: [],
  loginRedirect: false,
  sessionActive: false,
  login: () => {},
};

const Wrapper = (props) => (
  <Provider store={store()}>
    {/* eslint-disable-next-line */}
    <Login {...defaultProps} {...props} />
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

describe('Login component', () => {
  it('Renders component', async () => {
    await act(async () => {
      render(<Wrapper />);

      screen.getByText('Clericus');
    });
  });
  it('Renders email input', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.getByText('Email');
    });
  });
  it('Renders password input', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.getByText('Password');
    });
  });
  it('Renders submit button', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.getByText('Submit');
    });
  });
  it('Renders error container', async () => {
    await act(async () => {
      render(<Wrapper />);
      screen.getByRole('alert');
    });
  });
  it('Trigger error container', async () => {
    await act(async () => {
      render(<Wrapper />);
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() =>
        screen.getByText('Please provide a valid email address to continue')
      );
    });
  });
  it('Trigger error container', async () => {
    await act(async () => {
      render(<Wrapper />);
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() =>
        screen.getByText('Please provide a valid email address to continue')
      );
    });
  });
  it('Check invalid email submit', async () => {
    await act(async () => {
      const { container } = render(<Wrapper />);
      const inputEmail = container.querySelector(`input[name="email"]`);
      fireEvent.change(inputEmail, { target: { value: 'test@test' } });
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() =>
        screen.getByText('Please provide a valid email address to continue')
      );
    });
  });
  it('Check login submit', async () => {
    await act(async () => {
      const { container } = render(<Wrapper />);
      const inputEmail = container.querySelector(`input[name="email"]`);
      const inputPassword = container.querySelector(`input[name="password"]`);
      fireEvent.change(inputEmail, { target: { value: 'test@test.com' } });
      fireEvent.change(inputPassword, { target: { value: 'test123' } });
      fireEvent.click(screen.getByText('Submit'));
      await waitFor(() => {
        screen.getByText('Please provide a valid email address to continue');
      });
    });
  });

  /* it('removes text "Loading..."', async () => {
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
  }); */
});
