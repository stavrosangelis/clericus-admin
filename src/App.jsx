import React, { useCallback, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { loadProgressBar } from 'axios-progress-bar';
import { useDispatch, useSelector } from 'react-redux';

import { myHistory } from './helpers';
import HistoryRouter from './components/HistoryRouter';

// css
import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.css';
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import './assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css';
import './assets/leaflet/css/MarkerCluster.css';
import './assets/leaflet/leaflet.css';
import './assets/scss/App.scss';

import Login from './views/Login';
import Seed from './views/Seed';

// routes
import indexRoutes from './routes/index';

// layout components
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

import {
  checkFirstSession,
  checkSession,
  getLanguageCodes,
  getEventTypes,
  getOrganisationTypes,
  getPeopleRoles,
  getPersonTypes,
  getSystemTypes,
  loadDefaultEntities,
  loadSettings,
  resetSeedRedirect,
  toggleNav,
} from './redux/actions';

const { REACT_APP_BASENAME } = process.env;
// move to state to add theme support
const backgroundColor = 'black';
const activeColor = 'info';

const authToken = localStorage.getItem('token');
if (typeof authToken !== 'undefined' && authToken !== null) {
  axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
}

function App() {
  // redux store
  const dispatch = useDispatch();
  const { sessionActive, seedRedirect, settings, navOpen } = useSelector(
    (state) => state
  );
  const { seedingAllowed = false } = settings;

  useEffect(() => {
    const openSidebar = () => {
      if (window.innerWidth > 992 && !navOpen) {
        dispatch(toggleNav());
      }
    };
    openSidebar();
    dispatch(loadSettings());
    dispatch(checkFirstSession());
    /* eslint-disable-next-line */
  }, []);

  // set a timer to check if the user has an active session
  useEffect(() => {
    let interval = null;
    if (sessionActive) {
      interval = setInterval(() => {
        dispatch(checkSession());
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [dispatch, sessionActive]);

  // if user has a session load app data

  useEffect(() => {
    if (sessionActive) {
      loadProgressBar();
      dispatch(getSystemTypes());
      dispatch(getPeopleRoles());
      dispatch(getPersonTypes());
      dispatch(getOrganisationTypes());
      dispatch(getEventTypes());
      dispatch(loadDefaultEntities());
      dispatch(getLanguageCodes());
    }
  }, [sessionActive, dispatch]);

  // toggle sidebar on windows resize
  const toggleSideBar = useCallback(() => {
    if (window.innerWidth > 992 && !navOpen) {
      dispatch(toggleNav());
    }
    if (window.innerWidth < 992 && navOpen) {
      dispatch(toggleNav());
    }
  }, [navOpen, dispatch]);

  useEffect(() => {
    window.addEventListener('resize', toggleSideBar);
    return () => {
      window.removeEventListener('resize', toggleSideBar);
    };
  }, [toggleSideBar]);

  // redirects
  useEffect(() => {
    if (seedRedirect) {
      dispatch(resetSeedRedirect());
    }
  }, [seedRedirect, dispatch]);

  const parseRoutes = (routesParam = []) => {
    const routes = [];
    const { length } = routesParam;
    for (let i = 0; i < length; i += 1) {
      const route = routesParam[i];
      const { children = [], component = null, name = '', path = '' } = route;
      const CustomTag = component;
      let newRoute = null;
      if (component !== null) {
        const index = name === 'Home';
        newRoute = (
          <Route index={index} path={path} key={name} element={<CustomTag />} />
        );
      }
      routes.push(newRoute);
      if (children.length > 0) {
        routes.push(parseRoutes(children));
      }
    }
    return [...routes];
  };

  const routes = parseRoutes(indexRoutes);

  let appHTML = null;
  if (seedingAllowed) {
    appHTML = (
      <Routes basename={REACT_APP_BASENAME}>
        <Route path="/" element={<Seed />} />
      </Routes>
    );
  } else if (sessionActive) {
    const navOpenClass = navOpen ? ' nav-open' : '';
    appHTML = (
      <div className={`wrapper${navOpenClass}`} id="main-wrapper">
        <Sidebar
          routes={indexRoutes}
          bgColor={backgroundColor}
          activeColor={activeColor}
        />
        <div className="main-panel" id="main-panel">
          <Header />
          <div className="content">
            <Routes basename={REACT_APP_BASENAME}>{routes}</Routes>
          </div>
          <Footer />
        </div>
      </div>
    );
  } else {
    appHTML = (
      <Routes basename={REACT_APP_BASENAME}>
        <Route path="*" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/:status" element={<Login />} />
      </Routes>
    );
  }

  return (
    <HistoryRouter history={myHistory} basename={REACT_APP_BASENAME}>
      {appHTML}
    </HistoryRouter>
  );
}

export default App;
