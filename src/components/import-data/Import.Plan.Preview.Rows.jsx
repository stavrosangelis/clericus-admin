import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ImportPlanPreviewRow from './Import.Plan.Preview.Row';
import ImportPlanPreviewEntities from './Import.Plan.Preview.Entities';

const ImportPlanPreviewRows = (props) => {
  const { columns, rows, rules, relations, selectedRows } = props;

  const [preparedRelations, setPreparedRelations] = useState([]);

  useEffect(() => {
    const newRelations = [];
    const sLength = selectedRows.length;
    const rLength = relations.length;
    for (let i = 0; i < sLength; i += 1) {
      const selectedRow = selectedRows[i];
      const rowRelations = {
        row: selectedRow,
        relations: [],
      };
      for (let j = 0; j < rLength; j += 1) {
        const r = relations[j];
        const rValues = JSON.parse(r);
        const { srcId, targetId, srcType } = rValues;
        const newRelation = {
          srcId,
          targetId,
          srcType,
        };
        rowRelations.relations.push(newRelation);
      }
      newRelations.push(rowRelations);
    }
    setPreparedRelations(newRelations);
  }, [relations, selectedRows]);

  const blocks = rows.map((row) => {
    const rowRules = {
      events: rules.events.filter((e) => e.row === row.key) || [],
      organisations: rules.organisations.filter((e) => e.row === row.key) || [],
      people: rules.people.filter((e) => e.row === row.key) || [],
      resources: rules.resources.filter((e) => e.row === row.key) || [],
      spatials: rules.spatials.filter((e) => e.row === row.key) || [],
      temporals: rules.temporals.filter((e) => e.row === row.key) || [],
    };
    return (
      <div key={row.key}>
        <ImportPlanPreviewRow columns={columns} row={row} />
        <ImportPlanPreviewEntities
          rowKey={row.key}
          rules={rowRules}
          relations={preparedRelations}
        />
      </div>
    );
  });
  return blocks;
};
ImportPlanPreviewRows.defaultProps = {
  rules: [],
  relations: [],
  selectedRows: [],
};
ImportPlanPreviewRows.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  rules: PropTypes.object,
  relations: PropTypes.array,
  selectedRows: PropTypes.array,
};
export default ImportPlanPreviewRows;
