import React, { useState } from 'react';
import { Button, Card, CardBody, CardTitle, Collapse } from 'reactstrap';
import PropTypes from 'prop-types';
import parseMetadata from '../../helpers/parse-metadata';

import '../../assets/scss/metadata.scss';

function Block(props) {
  // state
  const [visible, setVisible] = useState(true);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  // props
  const { metadata } = props;

  const visibleIcon = visible ? '' : ' closed';

  const { image = null } = metadata;
  const output =
    image === null ? null : (
      <Card>
        <CardBody>
          <CardTitle onClick={toggleVisible}>
            Technical metadata
            <Button
              type="button"
              className="pull-right"
              color="secondary"
              outline
              size="xs"
            >
              <i className={`collapse-toggle fa fa-angle-left${visibleIcon}`} />
            </Button>
          </CardTitle>
          <Collapse isOpen={visible}>{parseMetadata(image)}</Collapse>
        </CardBody>
      </Card>
    );
  return output;
}

Block.defaultProps = {
  metadata: null,
};
Block.propTypes = {
  metadata: PropTypes.object,
};
export default Block;
