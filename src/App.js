import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch , Redirect} from 'react-router-dom';

import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.css';
import "./assets/scss/paper-dashboard.css";
import "./assets/demo/demo.css";
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import "./assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css";
import '../node_modules/leaflet/dist/leaflet.css';
import './assets/react-vis/style.css';
import './App.css';
import {loadProgressBar} from 'axios-progress-bar';

// routes
import indexRoutes from "./routes/index";
import Login from "./views/login";
import Seed from "./views/seed";

// layout components
import Header from "./components/header";
import Footer from "./components/footer";
import Sidebar from "./components/sidebar";
import {connect} from "react-redux";
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
  getLanguageCodes
} from "./redux/actions/main-actions";

// set default axios token;
import axios from 'axios';
let authToken = localStorage.getItem('token');
if (typeof authToken!=="undefined" && authToken!==null) {
  axios.defaults.headers.common['Authorization'] = 'Bearer '+authToken;
}

const mapStateToProps = state => {
  return {
    sessionActive: state.sessionActive,
    loginRedirect: state.loginRedirect,
    seedRedirect: state.seedRedirect,
    settings: state.settings
   };
};

function mapDispatchToProps(dispatch) {
  return {
    loadSettings: () => dispatch(loadSettings()),
    getSystemTypes: () => dispatch(getSystemTypes()),
    getPeopleRoles: () => dispatch(getPeopleRoles()),
    getPersonTypes: () => dispatch(getPersonTypes()),
    getOrganisationTypes: () => dispatch(getOrganisationTypes()),
    getEventTypes: () => dispatch(getEventTypes()),
    loadDefaultEntities: () => dispatch(loadDefaultEntities()),
    checkSession: () => dispatch(checkSession()),
    resetLoginRedirect: ()=>dispatch(resetLoginRedirect()),
    resetSeedRedirect: ()=>dispatch(resetSeedRedirect()),
    getLanguageCodes: ()=>dispatch(getLanguageCodes()),
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
      loginRedirect: false
    }

    this.openSidebar = this.openSidebar.bind(this);
    this.parseRoutes = this.parseRoutes.bind(this);
    this.parseChildrenRoutes = this.parseChildrenRoutes.bind(this);
  }

  openSidebar() {
    if (window.innerWidth > 992) {
      document.documentElement.classList.toggle("nav-open");
    }
  }

  parseRoutes() {
    let routes = [];
    for (let i=0; i<indexRoutes.length; i++) {
      let route = indexRoutes[i];
      let newRoute=[];
      if (route.component!==null) {
        newRoute = <Route path={route.path} key={i} component={route.component} />;
      }
      if (route.name==="Home") {
        newRoute = <Route exact path={route.path} key={i} component={route.component} />;
      }
      routes.push(newRoute);
      if (typeof route.children!=="undefined" && route.children.length>0) {
        let childrenRoutes = this.parseChildrenRoutes(route.children, i);
        routes.push(childrenRoutes);
      }
    }
    let flattenedRoutes = [].concat.apply([], routes);
    return flattenedRoutes;
  }

  parseChildrenRoutes(children, i) {
    let routes = [];
    for (let j=0;j<children.length; j++) {
      let childRoute = children[j];
      routes.push(<Route path={childRoute.path} key={i+"."+j} component={childRoute.component} />);
      if (typeof childRoute.children!=="undefined" && childRoute.children.length>0) {
        let childrenCRoutes = this.parseChildrenRoutes(childRoute.children,i+"."+j);
        routes.push(childrenCRoutes);
      }
    }
    return routes;
  }

  componentDidMount() {
    this.props.loadSettings();
    this.props.checkSession();
    this.props.getLanguageCodes();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sessionActive && this.props.sessionActive) {
      this.openSidebar();
      this.props.getSystemTypes();
      this.props.getPeopleRoles();
      this.props.getPersonTypes();
      this.props.getOrganisationTypes();
      this.props.getEventTypes();
      this.props.loadDefaultEntities();
      loadProgressBar();
    }
    if (this.props.loginRedirect) {
      this.props.resetLoginRedirect();
    }
    if (this.props.seedRedirect) {
      this.props.resetSeedRedirect();
    }
  }

  render() {
    let settings = this.props.settings;
    let routes = this.parseRoutes();
    let loginRedirect = [];
    let seedRedirect = [];

    if (this.props.loginRedirect) {
      loginRedirect = <Redirect to='/' />
    }
    if (this.props.seedRedirect) {
      seedRedirect = <Redirect to='/' />
    }
    let AppHTML = [];
    if (typeof settings.seedingAllowed!=="undefined" && settings.seedingAllowed) {
      AppHTML = <Router basename={process.env.REACT_APP_BASENAME}>
        {seedRedirect}
        <Seed />
      </Router>
    }
    else if (!this.props.sessionActive) {
      AppHTML = <Login />
    }
    // note to handle session active but no login
    else if (this.props.sessionActive) {
      AppHTML = <Router basename={process.env.REACT_APP_BASENAME}>
        <div className="wrapper" id="main-wrapper">
          {loginRedirect}
          <Sidebar
            {...this.props}
            routes={indexRoutes}
            bgColor={this.state.backgroundColor}
            activeColor={this.state.activeColor}
          />
          <div className="main-panel" id="main-panel">
            <Header {...this.props} />
            <div className="content" id="content-container">
              <Switch>
                {routes}
              </Switch>
            </div>
            <Footer fluid extraClass="main-footer"/>
          </div>
        </div>
      </Router>
    }
    return (
      <div>
        {AppHTML}
      </div>
    );
  }
}

export default App = connect(mapStateToProps, mapDispatchToProps)(App);
