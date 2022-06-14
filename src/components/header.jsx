import React, { Fragment, useState } from 'react';
import {
  Collapse,
  Navbar,
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Button,
} from 'reactstrap';
import { useDispatch } from 'react-redux';

import { toggleNav, logout } from '../redux/actions';
import '../assets/scss/header.scss';

import AboutModal from './About.modal';

function Header() {
  const dispatch = useDispatch();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const toggleSidebar = () => {
    dispatch(toggleNav());
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleAbout = () => {
    setAboutOpen(!aboutOpen);
  };

  const logoutFn = () => {
    dispatch(logout());
  };

  let userName = '';
  const user = JSON.parse(localStorage.getItem('user'));
  if (user !== null) {
    if (user.firstName !== '') {
      userName = user.firstName;
    }
    if (user.lastName !== '') {
      userName += ` ${user.lastName}`;
    }
    if (userName === '') {
      userName = user.email;
    }
  }

  return (
    <>
      <Navbar expand="md" className="main-navbar">
        <div className="navbar-wrapper">
          <div className="navbar-toggle">
            <button
              type="button"
              className="navbar-toggler left"
              onClick={() => toggleSidebar()}
            >
              <span className="navbar-toggler-bar bar1" />
              <span className="navbar-toggler-bar bar2" />
              <span className="navbar-toggler-bar bar3" />
            </button>
          </div>
        </div>
        <Collapse isOpen navbar className="justify-content-end user-menu">
          <Nav navbar>
            <Dropdown nav isOpen={dropdownOpen} toggle={() => toggleDropdown()}>
              <DropdownToggle caret nav>
                <i className="pe-header-bar-icon pe-7s-user" />
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem header>Welcome {userName}</DropdownItem>
                <DropdownItem tag="a" onClick={() => logoutFn()}>
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem>
              <Button
                color="link"
                className="top-nav-link-btn"
                onClick={() => toggleAbout()}
              >
                <i className="pe-header-bar-icon pe-7s-info" />
              </Button>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <AboutModal visible={aboutOpen} toggle={() => toggleAbout()} />
    </>
  );
}
export default Header;
