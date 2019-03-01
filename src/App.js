import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from "./redux/store";

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

// layout components
import Header from "./components/header";
import Footer from "./components/footer";
import Sidebar from "./components/sidebar";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      backgroundColor: "black",
      activeColor: "info",
    }

    this.openSidebar.bind(this);
  }

  openSidebar() {
    if (window.innerWidth > 992) {
      document.documentElement.classList.toggle("nav-open");
    }
  }

  componentDidMount() {
    this.openSidebar();
  }

  render() {
    let routes = [];
    for (let r=0; r<indexRoutes.length; r++) {
      let route = indexRoutes[r];
      let newRoute = <Route path={route.path} key={r} component={route.component} />;
      if (route.name==="Home") {
        newRoute = <Route exact path={route.path} key={r} component={route.component} />;
      }
      routes.push(newRoute);
      let childrenRoutes = route.children;
      for (let cr=0;cr<childrenRoutes.length; cr++) {
        let childRoute = childrenRoutes[cr];
        routes.push(<Route path={childRoute.path} key={r+"."+cr} component={childRoute.component} />);
      }
    }
    return (
      <Router basename='/'>
        <Provider store={store}>

        <div className="wrapper">
          <Sidebar
            {...this.props}
            routes={indexRoutes}
            bgColor={this.state.backgroundColor}
            activeColor={this.state.activeColor}
          />
          <div className="main-panel" ref="mainPanel">
            <Header {...this.props} />
            <div className="content">
              <Switch>
                {routes}
              </Switch>
            </div>
            <Footer fluid extraClass="main-footer"/>
          </div>
        </div>


        </Provider>
      </Router>
    );
  }
}

export default App;
