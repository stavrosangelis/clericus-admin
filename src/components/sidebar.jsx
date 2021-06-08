import React from 'react';
import { withRouter, NavLink, Link } from 'react-router-dom';
import { Nav } from 'reactstrap';
import PropTypes from 'prop-types';
import logosrc from '../assets/img/cos-logo-bw.png';
import '../assets/scss/sidebar.scss';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routes: [],
    };
    this.loadMenu.bind(this);
    this.toggleChildren.bind(this);
  }

  componentDidMount() {
    this.loadMenu();
  }

  loadMenu() {
    const { routes } = this.props;
    this.setState({
      routes,
    });
  }

  toggleChildren(key) {
    const { routes } = this.state;
    const item = routes[key];
    let childrenVisible = true;
    if (typeof item.childrenVisible !== 'undefined' && item.childrenVisible) {
      childrenVisible = false;
    }
    item.childrenVisible = childrenVisible;
    routes[key] = item;
    this.setState({
      routes,
    });
  }

  render() {
    const { location, bgColor, activeColor } = this.props;
    const currentPath = location.pathname;
    const navItems = [];
    const { routes } = this.state;
    if (routes.length > 0) {
      for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const key = i;
        let navItem = [];
        let activeRouteClass = '';
        if (currentPath === route.path) {
          activeRouteClass = 'active';
        }
        if (route.showMenu) {
          if (
            typeof route.children !== 'undefined' &&
            route.children.length > 0
          ) {
            const childrenNav = [];
            for (let c = 0; c < route.children.length; c += 1) {
              const child = route.children[c];
              if (child.showMenu) {
                let activeChildClass = '';
                if (currentPath === child.path) {
                  activeChildClass = ' active';
                }
                const childNavItem = (
                  <NavLink
                    to={child.path}
                    key={`${i}.${c}`}
                    className="nav-link"
                    activeClassName={activeChildClass}
                  >
                    <i className={child.icon} />
                    <p>{child.name}</p>
                  </NavLink>
                );
                childrenNav.push(childNavItem);
              }
            }
            let activeClass = '';
            if (
              typeof route.childrenVisible !== 'undefined' &&
              route.childrenVisible
            ) {
              activeClass = ' active';
            }

            if (childrenNav.length > 0) {
              const childrenPaths = [];
              for (let j = 0; j < route.children.length; j += 1) {
                const child = route.children[j];
                const childRoute = child.path;
                const childRouteArr = childRoute.split('/');
                childrenPaths.push(childRouteArr[1]);
              }
              const currentPathArr = currentPath.split('/');
              if (childrenPaths.indexOf(currentPathArr[1]) > -1) {
                if (activeClass !== ' active') {
                  activeClass = ' active';
                }
              }

              navItem = (
                <div>
                  <NavLink
                    to="#"
                    onClick={() => this.toggleChildren(key)}
                    className="nav-link tree-view"
                    activeClassName={activeRouteClass}
                  >
                    <i
                      className={`fa fa-angle-left toggle-treeview-icon${activeClass}`}
                    />
                    <i className={route.icon} />
                    <p>{route.name}</p>
                  </NavLink>
                  <ul className={`treeview-menu${activeClass}`}>
                    {childrenNav}
                  </ul>
                </div>
              );
            } else {
              navItem = (
                <NavLink
                  to={route.path}
                  className="nav-link"
                  activeClassName={activeRouteClass}
                >
                  <i className={route.icon} />
                  <p>{route.name}</p>
                </NavLink>
              );
            }
          } else {
            navItem = (
              <NavLink
                to={route.path}
                className="nav-link"
                activeClassName={activeRouteClass}
              >
                <i className={route.icon} />
                <p>{route.name}</p>
              </NavLink>
            );
          }
        }
        navItems.push(
          <li className={activeRouteClass} key={key}>
            {navItem}
          </li>
        );
      }
    }

    return (
      <div
        className="sidebar"
        data-color={bgColor}
        data-active-color={activeColor}
      >
        <div className="logo">
          <Link href="/" to="/" className="simple-text logo-mini">
            <img src={logosrc} className="img-logo" alt="Clericus logo" />
            {/* <div className="logo-container">
              <div className="triangle-left"></div>
              <div className="triangle-left-inner"></div>
              <div className="triangle-right"></div>
              <div className="triangle-right-inner"></div>
            </div> */}
          </Link>
          <Link href="/" to="/" className="simple-text logo-normal">
            Clericus
          </Link>
        </div>
        <div className="sidebar-wrapper">
          <Nav>{navItems}</Nav>
        </div>
      </div>
    );
  }
}
Sidebar.defaultProps = {
  routes: [],
  location: null,
  bgColor: '',
  activeColor: '',
};
Sidebar.propTypes = {
  routes: PropTypes.array,
  location: PropTypes.object,
  bgColor: PropTypes.string,
  activeColor: PropTypes.string,
};
export default withRouter(Sidebar);
