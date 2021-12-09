import React from 'react';
import { create } from 'react-test-renderer';
import { Provider } from 'react-redux';
import store from '../redux/store';
import App from '../App';

describe('renders app and tests init values', () => {
  it('render app', () => {
    const app = create(
      <Provider store={store()}>
        <App />
      </Provider>
    );
    const tree = app.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
