import React, { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Nav } from 'reactstrap';
import PropTypes from 'prop-types';

import logosrc from '../assets/img/cos-logo-bw.png';
import '../assets/scss/sidebar.scss';

function Sidebar(props) {
  const { activeColor, bgColor, routes = [] } = props;

  const [sRoutes, setSRoutes] = useState([]);

  useEffect(() => {
    setSRoutes(routes);
  }, [routes]);

  const toggleChildren = (key) => {
    const copy = [...routes];
    const item = routes[key];
    const { childrenVisible = false } = item;
    item.childrenVisible = !childrenVisible;
    copy[key] = item;
    setSRoutes(copy);
  };

  const location = useLocation();
  const { pathname = '/' } = location;
  const navItems = [];
  const { length } = sRoutes;
  if (length > 0) {
    for (let i = 0; i < length; i += 1) {
      const route = sRoutes[i];
      const {
        showMenu = false,
        children = [],
        name = '',
        icon = '',
        path = '',
        childrenVisible = false,
      } = route;
      let navItem = null;
      const activeRouteClass = pathname === path ? ' active' : '';
      if (showMenu) {
        if (children.length > 0) {
          const childrenNav = [];
          const { length: cLength } = children;
          const childrenPaths = [];
          for (let c = 0; c < cLength; c += 1) {
            const child = children[c];
            const {
              showMenu: cShowMenu = false,
              path: cPath = '',
              icon: cIcon = '',
              name: cName = '',
            } = child;
            if (cShowMenu) {
              const activeChildClass = pathname === cPath ? ' active' : '';
              const childNavItem = (
                <li key={`${i}.${c}`}>
                  <NavLink to={cPath} className={`nav-link${activeChildClass}`}>
                    <i className={cIcon} />
                    <p>{cName}</p>
                  </NavLink>
                </li>
              );
              childrenNav.push(childNavItem);
              const childRouteArr = cPath.split('/');
              childrenPaths.push(childRouteArr[1]);
            }
          }
          let activeClass = childrenVisible ? ' active' : '';

          if (childrenNav.length > 0) {
            const currentPathArr = pathname.split('/');
            if (
              childrenPaths.indexOf(currentPathArr[1]) > -1 &&
              activeClass !== ' active'
            ) {
              activeClass = ' active';
            }
            navItem = (
              <>
                <div
                  onClick={() => toggleChildren(i)}
                  onKeyDown={() => toggleChildren(i)}
                  role="button"
                  tabIndex="0"
                  className="nav-link tree-view"
                >
                  <i
                    className={`fa fa-angle-left toggle-treeview-icon${activeClass}`}
                  />
                  <i className={icon} />
                  <p>{name}</p>
                </div>
                <ul className={`treeview-menu${activeClass}`}>{childrenNav}</ul>
              </>
            );
          } else {
            navItem = (
              <NavLink to={path} className={`nav-link${activeRouteClass}`}>
                <i className={icon} />
                <p>{name}</p>
              </NavLink>
            );
          }
        } else {
          navItem = (
            <NavLink to={path} className={`nav-link${activeRouteClass}`}>
              <i className={icon} />
              <p>{name}</p>
            </NavLink>
          );
        }
      }
      navItems.push(
        <li className={activeRouteClass} key={name}>
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
Sidebar.defaultProps = {
  routes: [],
  bgColor: '',
  activeColor: '',
};
Sidebar.propTypes = {
  routes: PropTypes.array,
  bgColor: PropTypes.string,
  activeColor: PropTypes.string,
};
export default Sidebar;
