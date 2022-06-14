import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Label, Table } from 'reactstrap';
import { Link } from 'react-router-dom';

const OutputResults = (props) => {
  const { outputData, type } = props;

  let theadings = [];
  let outputDataJSX = [];
  if (outputData.length > 0) {
    if (type === 'unique') {
      theadings = (
        <tr>
          <th>#</th>
          <th>Text</th>
          <th>Rows</th>
        </tr>
      );
      outputDataJSX = outputData.map((o, i) => {
        const key = `o${i}`;
        const rows = o.rows.join(', ');
        return (
          <tr key={key}>
            <td>{i + 1}</td>
            <td>{o.text}</td>
            <td>
              <small>rows count: {o.rows.length}</small>
              <div className="import-results-rows">{rows}</div>
            </td>
          </tr>
        );
      });
    } else if (type === 'db-entries') {
      theadings = (
        <tr>
          <th>#</th>
          <th>Text</th>
          <th>Results</th>
        </tr>
      );
      outputDataJSX = outputData.map((o, i) => {
        const entries = o.entries.map((e) => (
          <div key={e._id}>
            _id: {e._id}, label: <Link to={e.link}>{e.label}</Link>
          </div>
        ));
        const key = `o${i}`;
        return (
          <tr key={key}>
            <td>{i + 1}</td>
            <td>{o.text}</td>
            <td>
              <small>results count: {entries.length}</small>
              <div className="import-results-rows">{entries}</div>
            </td>
          </tr>
        );
      });
    } else if (type === 'wf-dates') {
      const headings = outputData[0];
      theadings = (
        <tr>
          <th key="#">#</th>
          {headings.map((h) => (
            <th key={h[0].column}>{h[0].value}</th>
          ))}
        </tr>
      );

      outputDataJSX = outputData.map((o, i) => {
        if (i > 0) {
          const key = `o${i}`;
          const cells = [];
          o.forEach((od) => {
            const cellValues = od.map((odi, j) => {
              const validClass = odi.valid ? 'valid' : 'invalid';
              const odiKey = `${odi.column}.${j}`;
              return (
                <div key={odiKey} className={validClass}>
                  {odi.value}
                </div>
              );
            });
            cells.push(<td key={od[0].column}>{cellValues}</td>);
          });
          return (
            <tr key={key}>
              <td>{i}</td>
              {cells}
            </tr>
          );
        }
        return [];
      });
    }
  }

  const outputBlock =
    outputDataJSX.length > 0 ? (
      <Card>
        <CardBody>
          <Label>Results</Label>
          <Table striped responsive>
            <thead>{theadings}</thead>
            <tbody>{outputDataJSX}</tbody>
            <tfoot>{theadings}</tfoot>
          </Table>
        </CardBody>
      </Card>
    ) : (
      []
    );
  return outputBlock;
};

OutputResults.propTypes = {
  outputData: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
};

export default OutputResults;
