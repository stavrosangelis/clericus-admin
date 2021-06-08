import React, { useCallback, useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { loadProgressBar } from 'axios-progress-bar';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

// css
import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.css';
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import './assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css';
import '../node_modules/leaflet/dist/leaflet.css';
import './assets/scss/App.scss';

// routes
import indexRoutes from './routes/index';
import Login from './views/login';
import Seed from './views/seed';

// layout components
import Header from './components/header';
import Footer from './components/footer';
import Sidebar from './components/sidebar';

import {
  getSystemTypes,
  getPeopleRoles,
  getPersonTypes,
  getOrganisationTypes,
  getEventTypes,
  loadDefaultEntities,
  loadSettings,
  checkSession,
  resetLoginRedirect,
  resetSeedRedirect,
  getLanguageCodes,
} from './redux/actions';

const APIPath = process.env.REACT_APP_APIPATH;
const basename = process.env.REACT_APP_BASENAME;
// set default axios token;
const authToken = localStorage.getItem('token');
if (typeof authToken !== 'undefined' && authToken !== null) {
  axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
}

function App() {
  // redux store
  const dispatch = useDispatch();
  const sessionActive = useSelector((state) => state.sessionActive);
  const loginRedirect = useSelector((state) => state.loginRedirect);
  const seedRedirect = useSelector((state) => state.seedRedirect);
  const settings = useSelector((state) => state.settings);

  // state
  const [sessionRedirect, setSessionRedirect] = useState(false);

  const backgroundColor = 'black';
  const activeColor = 'info';

  const openSidebar = () => {
    if (window.innerWidth > 992) {
      document.documentElement.classList.toggle('nav-open');
    }
  };

  const parseChildrenRoutes = (children, i) => {
    const routes = [];
    for (let j = 0; j < children.length; j += 1) {
      const childRoute = children[j];
      routes.push(
        <Route
          path={childRoute.path}
          key={`${i}.${j}`}
          component={childRoute.component}
        />
      );
      if (
        typeof childRoute.children !== 'undefined' &&
        childRoute.children.length > 0
      ) {
        const childrenCRoutes = parseChildrenRoutes(
          childRoute.children,
          `${i}.${j}`
        );
        routes.push(childrenCRoutes);
      }
    }
    return routes;
  };

  const parseRoutes = () => {
    const routes = [];
    for (let i = 0; i < indexRoutes.length; i += 1) {
      const route = indexRoutes[i];
      let newRoute = [];
      if (route.component !== null) {
        newRoute = (
          <Route path={route.path} key={i} component={route.component} />
        );
      }
      if (route.name === 'Home') {
        newRoute = (
          <Route exact path={route.path} key={i} component={route.component} />
        );
      }
      routes.push(newRoute);
      if (typeof route.children !== 'undefined' && route.children.length > 0) {
        const childrenRoutes = parseChildrenRoutes(route.children, i);
        routes.push(childrenRoutes);
      }
    }
    const flattenedRoutes = [...routes];
    return flattenedRoutes;
  };

  const checkAppSession = useCallback(() => {
    const exec = async () => {
      const token = await new Promise((resolve) => {
        resolve(localStorage.getItem('token'));
      });
      const responseData = await axios({
        method: 'post',
        url: `${APIPath}admin-session`,
        crossDomain: true,
        data: { token },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      if (!responseData.status) {
        await dispatch(checkSession());
        setSessionRedirect(true);
      }
    };
    exec();
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadSettings());
    dispatch(checkSession());
    dispatch(getLanguageCodes());
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAppSession();
    }, 60000);
    return () => clearInterval(interval);
  }, [checkAppSession]);

  useEffect(() => {
    if (sessionActive) {
      openSidebar();
      loadProgressBar();
      dispatch(getSystemTypes());
      dispatch(getPeopleRoles());
      dispatch(getPersonTypes());
      dispatch(getOrganisationTypes());
      dispatch(getEventTypes());
      dispatch(loadDefaultEntities());
    }
  }, [sessionActive, dispatch]);

  useEffect(() => {
    if (loginRedirect) {
      dispatch(resetLoginRedirect());
    }
  }, [loginRedirect, dispatch]);

  useEffect(() => {
    if (seedRedirect) {
      dispatch(resetSeedRedirect());
    }
  }, [seedRedirect, dispatch]);

  useEffect(() => {
    if (sessionRedirect) {
      setSessionRedirect(false);
    }
  }, [sessionRedirect]);

  const routes = parseRoutes();
  const loginRedirectElem = loginRedirect ? <Redirect to="/" /> : [];
  const seedRedirectElem = seedRedirect ? <Redirect to="/" /> : [];
  const sessionRedirectElem = sessionRedirect ? <Redirect to="/login" /> : [];
  let appHTML = [];
  if (
    typeof settings.seedingAllowed !== 'undefined' &&
    settings.seedingAllowed
  ) {
    appHTML = (
      <Router basename={basename}>
        {seedRedirectElem}
        <Seed />
      </Router>
    );
  } else if (!sessionActive) {
    appHTML = <Login />;
  } else if (sessionActive) {
    appHTML = (
      <Router basename={basename}>
        <div className="wrapper" id="main-wrapper">
          {loginRedirectElem}
          {sessionRedirectElem}
          <Sidebar
            routes={indexRoutes}
            bgColor={backgroundColor}
            activeColor={activeColor}
          />
          <div className="main-panel" id="main-panel">
            <Header />
            <div className="content">
              <Switch>{routes}</Switch>
            </div>
            <Footer fluid extraClass="main-footer" />
          </div>
        </div>
      </Router>
    );
  }
  return <div>{appHTML}</div>;
}

export default App;
