/*eslint-disable*/
import React from "react";
import { Container, Row } from "reactstrap";
// used for making the prop types of this component
import PropTypes from "prop-types";
import logo from '../assets/img/logo-transparentx400.png'

class Footer extends React.Component {
  render() {
    return (
      <footer
        className={"footer"+" "+this.props.extraClass}
      >
        <Container fluid={this.props.fluid ? true : false}>
          <Row>
            <nav className="footer-nav">
              <ul>
                <li>
                  <a href="#" target="_blank">
                    <img src={logo} className="footer-logo" alt="Maynooth University / Arts & Humanities Institute (MUAHI)" />
                    <span>Maynooth University / Arts & Humanities Institute (MUAHI)</span></a>
                </li>
              </ul>
            </nav>
            <div className="credits ml-auto">
              <div className="copyright">
                &copy; {1900 + new Date().getYear()}
              </div>
            </div>
          </Row>
        </Container>
      </footer>
    );
  }
}

Footer.propTypes = {
  default: PropTypes.bool,
  fluid: PropTypes.bool
};

export default Footer;
