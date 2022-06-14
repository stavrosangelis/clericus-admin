import React from 'react';
import logo from '../assets/img/logo-transparentx400.png';
import '../assets/scss/footer.scss';

function Footer() {
  return (
    <footer className="footer main-footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-9">
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
          </div>
          <div className="col-sm-12 col-md-3">
            <div className="credits ml-auto text-end">
              <div className="copyright">
                &copy; 2020 - {1900 + new Date().getYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
