import React from 'react';
import { Container, Row } from 'reactstrap';
// used for making the prop types of this component
import PropTypes from 'prop-types';
import logo from '../assets/img/logo-transparentx400.png';
import '../assets/scss/footer.scss';

const Footer = (props) => {
  const { extraClass, fluid } = props;
  return (
    <footer className={`footer ${extraClass}`}>
      <Container fluid={fluid}>
        <Row>
          <nav className="footer-nav">
            <ul>
              <li>
                <a
                  href="https://www.maynoothuniversity.ie/arts-and-humanities-institute"
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={logo}
                    className="footer-logo"
                    alt="Maynooth University / Arts & Humanities Institute (MUAHI)"
                  />
                  <span>
                    Maynooth University / Arts & Humanities Institute (MUAHI)
                  </span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="credits ml-auto">
            <div className="copyright">
              &copy; 2020 - {1900 + new Date().getYear()}
            </div>
          </div>
        </Row>
      </Container>
    </footer>
  );
};

Footer.defaultProps = {
  extraClass: '',
  fluid: false,
};
Footer.propTypes = {
  extraClass: PropTypes.string,
  fluid: PropTypes.bool,
};

export default Footer;
