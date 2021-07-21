import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';

const AboutModal = (props) => {
  const { visible, toggle } = props;
  return (
    <Modal isOpen={visible} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        Clericus Content Management Admin Interface
      </ModalHeader>
      <ModalBody>
        <div>
          <b>Version</b>: {process.env.REACT_APP_VERSION}
        </div>
        <div>
          <b>Author</b>:{' '}
          <a
            href="https://www.maynoothuniversity.ie/people/stavros-angelis"
            target="_blank"
            rel="noreferrer"
          >
            Stavros Angelis
          </a>
        </div>
        <div>
          <b>Licence</b>:{' '}
          <a
            href="https://opensource.org/licenses/ISC"
            target="_blank"
            rel="noreferrer"
          >
            ISC License (ISC)
          </a>
        </div>
      </ModalBody>
    </Modal>
  );
};

AboutModal.defaultProps = {
  visible: false,
  toggle: () => {},
};
AboutModal.propTypes = {
  visible: PropTypes.bool,
  toggle: PropTypes.func,
};
export default AboutModal;
