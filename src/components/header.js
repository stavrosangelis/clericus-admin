import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Container,
} from 'reactstrap';

import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';

import dashboardRoutes from '../routes/index';
import { logout } from '../redux/actions';

function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(logout()),
  };
}

class Header extends Component {
  static openSidebar() {
    document.documentElement.classList.toggle('nav-open');
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      dropdownOpen: false,
    };
    this.toggle = this.toggle.bind(this);
    this.dropdownToggle = this.dropdownToggle.bind(this);
  }

  getBrand() {
    const { location } = this.prop;
    let name;
    dashboardRoutes.map((prop) => {
      if (prop.collapse) {
        prop.views.map((p) => {
          if (p.path === location.pathname) {
            name = p.name;
          }
          return null;
        });
      } else if (prop.redirect) {
        if (prop.path === location.pathname) {
          name = prop.name;
        }
      } else if (prop.path === location.pathname) {
        name = prop.name;
      }
      return null;
    });
    return name;
  }

  toggle() {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen,
    });
  }

  dropdownToggle() {
    const { dropdownOpen } = this.state;
    this.setState({
      dropdownOpen: !dropdownOpen,
    });
  }

  render() {
    const { isOpen, dropdownOpen } = this.state;
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
    const { logout: logoutFn } = this.props;
    return (
      <Navbar expand="md" className="main-navbar">
        <Container fluid>
          <div className="navbar-wrapper">
            <div className="navbar-toggle">
              <button
                type="button"
                className="navbar-toggler left"
                onClick={() => this.constructor.openSidebar()}
              >
                <span className="navbar-toggler-bar bar1" />
                <span className="navbar-toggler-bar bar2" />
                <span className="navbar-toggler-bar bar3" />
              </button>
            </div>
          </div>
          <NavbarToggler onClick={this.toggle}>
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
            <span className="navbar-toggler-bar navbar-kebab" />
          </NavbarToggler>
          <Collapse isOpen={isOpen} navbar className="justify-content-end">
            <Nav navbar>
              <Dropdown
                nav
                isOpen={dropdownOpen}
                toggle={(e) => this.dropdownToggle(e)}
              >
                <DropdownToggle caret nav>
                  <i className="pe-header-bar-icon pe-7s-user" />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem header>Welcome {userName}</DropdownItem>
                  <DropdownItem tag="a" onClick={() => logoutFn()}>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    );
  }
}
Header.defaultProps = {
  logout: () => {},
};
Header.propTypes = {
  logout: PropTypes.func,
};
export default compose(connect(null, mapDispatchToProps))(Header);
