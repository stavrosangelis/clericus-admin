import React, { useLayoutEffect, useState } from 'react';
import { Router } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function HistoryRouter(props) {
  const { basename, children, history } = props;
  const { action, location } = history;
  const [state, setState] = useState({
    action,
    location,
  });

  useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  );
}

HistoryRouter.propTypes = {
  basename: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};
