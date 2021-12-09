import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Button, Card, CardTitle, CardBody } from 'reactstrap';

import { getData, returnLetter } from '../../helpers';

const Columns = (props) => {
  // props
  const { importId, updateColumns, update } = props;

  // state
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(true);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(true);

  const toggle = () => {
    setOpen(!open);
  };

  const load = useCallback(async () => {
    setLoading(false);
    const response = await getData('import', { _id: importId });
    if (response.status) {
      const { data: responseData } = response;
      const completed = responseData.columnsParsed || false;
      if (completed) {
        setRunning(false);
        setData(responseData.columns);
        updateColumns(responseData.columns);
      }
    }
  }, [importId, updateColumns]);

  useEffect(() => {
    let interval = null;
    if (loading) {
      load();
    }
    if (running) {
      interval = setInterval(() => {
        load();
      }, 5000);
    }
    if (interval !== null) {
      return () => clearInterval(interval);
    }
    return false;
  }, [running, load, loading]);

  useEffect(() => {
    if (update) {
      setRunning(true);
    }
  }, [update]);

  const openBtnActive = open ? ' active' : '';
  const output = data.map((d, i) => {
    const key = `c${i}`;
    const letter = returnLetter(i).toUpperCase();
    return (
      <div key={key} className="col-block">
        <small>{i + 1}</small> [{letter}] {d}
      </div>
    );
  });
  return (
    <div>
      <Card>
        <CardBody>
          <CardTitle onClick={() => toggle()}>
            File Columns
            <Button type="button" className="pull-right" size="xs" outline>
              <i
                className={`collapse-toggle fa fa-angle-left${openBtnActive}`}
              />
            </Button>
          </CardTitle>
          <Collapse isOpen={open}>{output}</Collapse>
        </CardBody>
      </Card>
    </div>
  );
};

Columns.defaultProps = {
  importId: '',
  update: false,
};
Columns.propTypes = {
  importId: PropTypes.string,
  updateColumns: PropTypes.func.isRequired,
  update: PropTypes.bool,
};

export default Columns;
