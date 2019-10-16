import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch , Redirect} from 'react-router-dom';
import {loadProgressBar} from 'axios-progress-bar';

import 'axios-progress-bar/dist/nprogress.css';
import 'bootstrap/dist/css/bootstrap.css';
import "./assets/scss/paper-dashboard.css";
import "./assets/demo/demo.css";
import './assets/fonts/roboto/css/roboto.css';
import './assets/fonts/font-awesome/css/font-awesome.min.css';
import "./assets/fonts/pe-icon-7/css/pe-icon-7-stroke.css";
import './App.css';

// routes
import indexRoutes from "./routes/index";
import Login from "./views/login";

// layout components
import Header from "./components/header";
import Footer from "./components/footer";
import Sidebar from "./components/sidebar";
import {connect} from "react-redux";
import {
  getSystemTypes,
  getPeopleRoles,
  loadDefaultEntities,
  checkSession,
  resetLoginRedirect,
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
    loginRedirect: state.loginRedirect
   };
};

function mapDispatchToProps(dispatch) {
  return {
    getSystemTypes: () => dispatch(getSystemTypes()),
    getPeopleRoles: () => dispatch(getPeopleRoles()),
    loadDefaultEntities: () => dispatch(loadDefaultEntities()),
    checkSession: () => dispatch(checkSession()),
    resetLoginRedirect: ()=>dispatch(resetLoginRedirect()),
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
      loginRedirect: false,
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
    this.props.checkSession();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sessionActive && this.props.sessionActive) {
      this.openSidebar();
      this.props.getSystemTypes();
      this.props.getPeopleRoles();
      this.props.loadDefaultEntities();
      loadProgressBar();
    }
    if (this.props.loginRedirect) {
      this.props.resetLoginRedirect();
    }
  }

  render() {
    let routes = this.parseRoutes();
    let loginRedirect = [];
    if (this.props.loginRedirect) {
      loginRedirect = <Redirect to='/' />
    }
    let AppHTML =  <Router basename={process.env.REACT_APP_BASENAME}>
        <Login />
      </Router>;
    if (this.props.sessionActive) {
      AppHTML = <Router basename='/'>
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
