import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function ImportPlanPreviewRow(props) {
  const { columns, row } = props;

  const [positions, setPositions] = useState([]);
  const [resizing, setResizing] = useState(false);
  const [resizingIndex, setResizingIndex] = useState(-1);
  const [x, setX] = useState(0);

  const startResize = (e, i = -1) => {
    e.preventDefault();
    if (!resizing) {
      setResizing(true);
      setResizingIndex(i);
      setX(e.pageX);
    }
  };

  useEffect(() => {
    const newPositions = columns.map((r, i) => {
      const left = 100 * (i + 1);
      return {
        left,
        width: 100,
      };
    });
    setPositions(newPositions);
    /* eslint-disable-next-line */
  }, []);

  const updatedPosition = (position, newX) => {
    let { left: positionLeft, width: positionWidth } = position;
    positionLeft += newX;
    positionWidth += newX;
    const newPosition = { left: positionLeft, width: positionWidth };
    return newPosition;
  };

  useEffect(() => {
    const interact = (e) => {
      if (!resizing) {
        return false;
      }
      const positionsCopy = [...positions];
      const position = { ...positionsCopy[resizingIndex] };
      const newX = e.pageX - x;
      positionsCopy[resizingIndex] = updatedPosition(position, newX);
      setX(e.pageX);
      setPositions(positionsCopy);
      return newX;
    };

    const interactionEnd = () => {
      if (!resizing) {
        return false;
      }
      setResizing(false);
      setResizingIndex(-1);
      setX(0);
      return false;
    };

    document.addEventListener('contextmenu', interactionEnd);
    document.addEventListener('dragstart', interact);
    document.addEventListener('mousemove', interact);
    document.addEventListener('touchmove', interact);
    document.addEventListener('mouseup', interactionEnd);
    document.addEventListener('touchend', interactionEnd);
    document.addEventListener('dragend', interactionEnd);
    return () => {
      document.removeEventListener('contextmenu', interactionEnd);
      document.removeEventListener('dragstart', interact);
      document.removeEventListener('mousemove', interact);
      document.removeEventListener('touchmove', interact);
      document.removeEventListener('mouseup', interactionEnd);
      document.removeEventListener('touchend', interactionEnd);
      document.removeEventListener('dragend', interactionEnd);
    };
  }, [positions, resizing, resizingIndex, x]);

  const headerCells =
    positions.length > 0
      ? columns.map((c, i) => {
          const key = `th-${i}`;
          const { width } = positions[i];
          return (
            <th
              key={key}
              style={{ minWidth: `${width}px`, maxWidth: `${width}px` }}
            >
              <div className="th-content-container">
                <div className="th-content">
                  {i} {c}
                </div>
                <div
                  className="col-resize"
                  onDragStart={(e) => {
                    e.preventDefault();
                  }}
                  draggable={false}
                  onMouseDown={(e) => startResize(e, i)}
                  onKeyDown={(e) => e.preventDefault()}
                  role="button"
                  tabIndex="-1"
                  aria-label="Resize column"
                />
              </div>
            </th>
          );
        })
      : [];
  const headerRow = positions.length > 0 ? <tr>{headerCells}</tr> : [];
  const rowBodyCells =
    positions.length > 0
      ? row.data.map((c, j) => {
          const key = `td-${j}`;
          return <td key={key}>{c}</td>;
        })
      : [];
  return (
    <div className="table-responsive import-plan-preview-table-container">
      <b>Row</b>:{row.key}
      <table className="table table-bordered import-plan-preview-table">
        <thead>{headerRow}</thead>
        <tbody>
          <tr>{rowBodyCells}</tr>
        </tbody>
      </table>
    </div>
  );
}

ImportPlanPreviewRow.propTypes = {
  columns: PropTypes.array.isRequired,
  row: PropTypes.object.isRequired,
};
export default ImportPlanPreviewRow;
