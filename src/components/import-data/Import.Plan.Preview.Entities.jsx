import React, { useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

const entityColor = (typeParam = 'event') => {
  const type = typeParam.toLowerCase();
  let color;
  switch (type) {
    case 'event':
      color = '#F9CD1B';
      break;
    case 'organisation':
      color = '#9B8CF2';
      break;
    case 'person':
      color = '#5DC910';
      break;
    case 'resource':
      color = '#00CBFF';
      break;
    case 'spatial':
      color = '#875d1f';
      break;
    case 'temporal':
      color = '#2eeace';
      break;
    default:
      color = '#333';
      break;
  }
  return color;
};

const isJSON = (value) => {
  if (value.length === 0) {
    return false;
  }
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

const parseArray = (values) => {
  const output = [];
  values.forEach((v) => {
    const value = isJSON(v) ? JSON.parse(v) : v;
    output.push(value);
  });
  return output;
};

const prepareValue = (key, value) => {
  const output = {};
  if (value !== null) {
    switch (typeof value) {
      case 'string':
        output[key] = value;
        break;
      case 'object':
        if (Array.isArray(value) && value.length > 0) {
          output[key] = parseArray(value);
        } else {
          output[key] = value;
        }
        break;
      default:
        break;
    }
  }
  if (Object.keys(output).length === 0) {
    return null;
  }
  return output;
};

const prepareItem = (item) => {
  const keys = Object.keys(item);
  const output = {};
  keys.forEach((key) => {
    const value = item[key];
    const parsedVal = prepareValue(key, value);
    if (parsedVal !== null) {
      output[key] = parsedVal[key];
    }
  });
  return output;
};

function Block(props) {
  const { item, rowKey, type, select, selectedBlocks } = props;
  const borderColor = entityColor(type);
  const pi = prepareItem(item);
  const output = [];
  let y = 28;
  let width = 28;
  let height = 28;
  const rowChars = 28;
  const keys = Object.keys(pi);
  keys.forEach((k, idx) => {
    const value = pi[k];
    if (!Array.isArray(value) && value !== '') {
      let itemKey = `${k}.${idx}`;
      const string = `${k}: ${value}`;
      const charLength = string.length;
      const newWidth = charLength * 13;
      if (newWidth > width && newWidth <= 300) {
        width = newWidth;
      }

      if (string.length <= rowChars) {
        output.push(
          <tspan key={itemKey} x="15" y={y}>
            {string}
          </tspan>
        );
        y += 20;
        height += 20;
      } else {
        const rowsLength = charLength / rowChars;
        for (let j = 0; j < rowsLength; j += 1) {
          const start = j * rowChars;
          const end = start + rowChars;
          const chunk = string.substring(start, end);
          itemKey = `${itemKey}.${j}`;
          output.push(
            <tspan key={itemKey} x="15" y={y}>
              {chunk}
            </tspan>
          );
          y += 20;
          height += 20;
        }
      }
    }
    if (Array.isArray(value) && value.length > 0) {
      const itemKey = `${k}.${idx}`;
      output.push(
        <tspan key={itemKey} x="15" y={y}>
          {k}:
        </tspan>
      );
      y += 20;
      height += 20;
      value.forEach((subItem, sIdx) => {
        if (typeof subItem === 'string') {
          let subItemKey = `${itemKey}.${sIdx}`;
          const string = `${sIdx + 1}: ${subItem}`;
          // console.log(sk, subItem);
          const charLength = string.length;
          const newWidth = charLength * 13;
          if (newWidth > width && newWidth <= 300) {
            width = newWidth;
          }
          if (string.length <= rowChars) {
            output.push(
              <tspan key={subItemKey} x="30" y={y}>
                {string}
              </tspan>
            );
            y += 20;
            height += 20;
          } else {
            const rowsLength = charLength / rowChars;
            for (let j = 0; j < rowsLength; j += 1) {
              const start = j * rowChars;
              const end = start + rowChars;
              const chunk = string.substring(start, end);
              subItemKey = `${subItemKey}.${j}`;
              output.push(
                <tspan key={subItemKey} x="30" y={y}>
                  {chunk}
                </tspan>
              );
              y += 20;
              height += 20;
            }
          }
        } else {
          const subKeys = Object.keys(subItem);
          subKeys.forEach((subKey, skIdx) => {
            const subVal = subItem[subKey];
            let subItemKey = `${itemKey}.${sIdx}.${skIdx}`;
            const string = `${subKey}: ${subVal}`;
            const charLength = string.length;
            const newWidth = charLength * 13;
            if (newWidth > width && newWidth <= 300) {
              width = newWidth;
            }

            if (string.length <= rowChars) {
              output.push(
                <tspan key={subItemKey} x="30" y={y}>
                  {string}
                </tspan>
              );
              y += 20;
              height += 20;
            } else {
              const rowsLength = charLength / rowChars;
              for (let j = 0; j < rowsLength; j += 1) {
                const start = j * rowChars;
                const end = start + rowChars;
                const chunk = string.substring(start, end);
                subItemKey = `${subItemKey}.${j}`;
                output.push(
                  <tspan key={subItemKey} x="30" y={y}>
                    {chunk}
                  </tspan>
                );
                y += 20;
                height += 20;
              }
            }
          });
        }
      });
    }
  });

  const { length: labelCharLength = 0 } = type;
  const labelWidth = labelCharLength * 6;
  const labelX = width - labelWidth;
  const labelY = height;
  height += 10;
  const { refId = '' } = item;
  let id = rowKey;
  if (refId !== '') {
    id += `.${refId}`;
  }
  const strippedId = id.split('.')[1] || null;
  let strokeWidth = 2;
  if (selectedBlocks.indexOf(strippedId) > -1) {
    strokeWidth = 10;
  }
  return (
    <div
      onClick={(e) => select(e, id)}
      onKeyDown={(e) => select(e, id)}
      role="button"
      tabIndex="0"
    >
      <svg id={id} width={width + 2} height={height + 2}>
        <rect
          width={width}
          height={height}
          x="1"
          y="1"
          rx="12"
          ry="12"
          style={{
            fill: 'rgb(255, 255, 255)',
            strokeWidth,
            stroke: borderColor,
          }}
        />
        <text x="28" y="15" style={{ fill: '#333', fontSize: '15px' }}>
          {output}
          <tspan style={{ fontSize: '10px' }} x={labelX} y={labelY}>
            {type}
          </tspan>
        </text>
      </svg>
    </div>
  );
}

Block.propTypes = {
  item: PropTypes.object.isRequired,
  rowKey: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  select: PropTypes.func.isRequired,
  selectedBlocks: PropTypes.array.isRequired,
};

let svgLinesH = [];
let svgLinesV = [];

const uniqueLineH = (x1Param, y1Param, x2Param, y2Param) => {
  const x1 = x1Param;
  let y1 = y1Param;
  const x2 = x2Param;
  let y2 = y2Param;
  const diff = 15;
  const newL = y1;
  const existing = svgLinesH.find((l) => l === newL) || null;
  if (existing !== null) {
    y1 -= diff;
    y2 -= diff;
    return uniqueLineH(x1, y1, x2, y2);
  }
  svgLinesH.push(newL);
  return { x1, y1, x2, y2 };
};

const uniqueLineV = (x1Param, y1Param, x2Param, y2Param) => {
  let x1 = x1Param;
  const y1 = y1Param;
  let x2 = x2Param;
  const y2 = y2Param;
  const diff = 15;
  const newL = x1;
  const existing = svgLinesV.find((l) => l === newL) || null;
  if (existing !== null) {
    x1 -= diff;
    x2 -= diff;
    return uniqueLineV(x1, y1, x2, y2);
  }
  svgLinesV.push(newL);
  return { x1, y1, x2, y2 };
};

function SVGLine(props) {
  const {
    count,
    label,
    role = null,
    srcId,
    targetId,
    srcType,
    selectedBlocks,
    selectedBlock,
    rowKey,
  } = props;

  const space = 15;
  const srcElement = document.getElementById(srcId) || null;
  const targetElement = document.getElementById(targetId) || null;
  if (srcElement !== null && targetElement !== null) {
    const {
      x: sx,
      y: sy,
      height: sheight,
    } = srcElement.getBoundingClientRect();

    const {
      x: tx,
      y: ty,
      width: twidth,
    } = targetElement.getBoundingClientRect();
    // const diff = 5;

    // line 1
    // const l1Diff = space * count;
    const sHalfHeight = sheight / 2;
    const smiddle = sy + sHalfHeight;
    const parts = count > 1 ? (count / 2) * space : 0;
    const lowerPoint = smiddle + parts;

    const {
      x1: l1x1,
      y1: l1y1,
      x2: l1x21,
      y2: l1y2,
    } = uniqueLineH(sx, lowerPoint, sx - 30, lowerPoint);
    let l1x2 = l1x21;

    // line 2
    const {
      x1: l2x1,
      y1: l2y1,
      x2: l2x2,
      y2: l2y21,
    } = uniqueLineV(l1x2 + 1, l1y1 - 1, l1x2 + 1, ty - 30);
    let l2y2 = l2y21;
    if (l1x2 !== l2x1) {
      l1x2 = l2x1;
    }

    // line 3
    const l3hw = twidth / 2;
    const {
      x1: l3x1,
      y1: l3y1,
      x2: l3x21,
      y2: l3y2,
    } = uniqueLineH(l2x1, l2y2, tx + l3hw + 15, l2y2);
    if (l2y2 !== l3y1) {
      l2y2 = l3y1;
    }
    let l3x2 = l3x21;

    // line 4
    const {
      x1: l4x1,
      y1: l4y1,
      x2: l4x2,
      y2: l4y2,
    } = uniqueLineV(l3x2 - 1, l3y1 - 1, l3x2 - 1, ty);
    if (l4x1 !== l3x2) {
      l3x2 = l4x1;
    }

    const container = document.getElementById(
      `import-plan-preview-entities-container-${rowKey}`
    );
    const {
      x: cx,
      y: cy,
      width: cwidth,
      height: cheight,
    } = container.getBoundingClientRect();
    const color = entityColor(srcType);

    const textDiff = l3x2 > l3x1 ? l3x2 - l3x1 : l3x1 - l3x2;
    const textDiffHalf = textDiff / 2;
    const textCenter = l3x2 > l3x1 ? l3x1 + textDiffHalf : l3x2 + textDiffHalf;
    let labelText = label;
    if (role !== null && typeof role.termLabel !== 'undefined') {
      labelText += ` as ${role.termLabel}`;
    }
    const textLength = labelText.length * 7;
    const textHalfWidth = textLength / 2;
    const textX = textCenter - textHalfWidth;
    const strippedSrcId = srcId.split('.')[1] || null;
    const strippedTargetId = targetId.split('.')[1] || null;
    let strokeWidth = 3;
    let fontSize = '11px';
    let fontWeight = 'normal';
    if (
      (selectedBlock === strippedSrcId || selectedBlock === strippedTargetId) &&
      (selectedBlocks.indexOf(strippedSrcId) > -1 ||
        selectedBlocks.indexOf(strippedTargetId) > -1)
    ) {
      strokeWidth = 8;
      fontSize = '13px';
      fontWeight = 'bold';
    }

    return (
      <svg
        className="svg-container"
        viewBox={`${cx} ${cy} ${cwidth} ${cheight}`}
        data-src={srcId}
        data-target={targetId}
      >
        <line
          x1={l1x1}
          y1={l1y1}
          x2={l1x2}
          y2={l1y2}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <line
          x1={l2x1}
          y1={l2y1}
          x2={l2x2}
          y2={l2y2}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <line
          x1={l3x1}
          y1={l3y1}
          x2={l3x2}
          y2={l3y2}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <line
          x1={l4x1}
          y1={l4y1}
          x2={l4x2}
          y2={l4y2}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <rect
          width={textLength}
          height={16}
          x={textX - 5}
          y={l3y1 + 3}
          style={{
            fill: 'rgb(255, 255, 255)',
            opacity: '0.7',
          }}
        />
        <text
          x={textX}
          y={l3y1 + 15}
          style={{ fill: color, fontSize, fontWeight }}
        >
          {labelText}
        </text>
      </svg>
    );
  }
  return [];
}

SVGLine.defaultProps = {
  role: null,
  selectedBlock: null,
};
SVGLine.propTypes = {
  count: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  role: PropTypes.object,
  rowKey: PropTypes.number.isRequired,
  selectedBlock: PropTypes.string,
  srcId: PropTypes.string.isRequired,
  srcType: PropTypes.string.isRequired,
  targetId: PropTypes.string.isRequired,
  selectedBlocks: PropTypes.array.isRequired,
};

function ImportPlanPreviewEntities(props) {
  const { rules, relations, rowKey } = props;
  const [renderComplete, setRenderComplete] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [relationsOutput, setRelationsOutput] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [scale, setScale] = useState(1);
  const [containerHeight, setContainerHeight] = useState('auto');

  const entitiesContainer = useRef(null);

  const updateSelectedBlock = useCallback(
    (e, val) => {
      e.preventDefault();
      setSelectedBlocks([]);
      const itemId = val.split('.')[1] || null;
      if (itemId !== null) {
        setSelectedBlock(itemId);
        const itemRelations =
          relations[0].relations.filter(
            (r) => r.srcId === itemId || r.targetId === itemId
          ) || [];
        const relatedIds = [];
        itemRelations.forEach((ir) => {
          if (relatedIds.indexOf(ir.srcId) === -1) {
            relatedIds.push(ir.srcId);
          }
          if (relatedIds.indexOf(ir.targetId) === -1) {
            relatedIds.push(ir.targetId);
          }
        });
        setSelectedBlocks(relatedIds);
      }
      return false;
    },
    [relations]
  );

  const render = useCallback(() => {
    const newBlocks = [];
    let outputPeople = [];
    let outputEvents = [];
    let outputOrganisations = [];
    let outputResources = [];
    let outputSpatials = [];
    let outputTemporals = [];
    if (rules.people.length > 0) {
      const peopleItems = [];
      const peopleIds = [];
      const peopleLength = rules.people.length;
      for (let i = 0; i < peopleLength; i += 1) {
        const item = rules.people[i];
        const id = item._id || null;
        if (id === null || peopleIds.indexOf(id) === -1) {
          if (id !== null) {
            peopleIds.push(id);
          }

          const key = `person-${i}-${id}`;
          peopleItems.push(
            <Block
              key={key}
              item={item}
              type="person"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputPeople = (
        <div className="import-plan-preview-entities" key="people-block">
          <div className="import-plan-preview-entities-items people">
            {peopleItems}
          </div>
        </div>
      );
      newBlocks.push(outputPeople);
    }
    if (rules.events.length > 0) {
      const eventsItems = [];
      const eventsIds = [];
      const eventsLength = rules.events.length;
      for (let i = 0; i < eventsLength; i += 1) {
        const item = rules.events[i];
        const id = item._id || null;
        if (id === null || eventsIds.indexOf(id) === -1) {
          if (id !== null) {
            eventsIds.push(id);
          }
          const key = `event-${i}`;
          eventsItems.push(
            <Block
              key={key}
              item={item}
              type="event"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputEvents = (
        <div className="import-plan-preview-entities" key="events-block">
          <div className="import-plan-preview-entities-items events">
            {eventsItems}
          </div>
        </div>
      );
      newBlocks.push(outputEvents);
    }
    if (rules.organisations.length > 0) {
      const organisationsItems = [];
      const organisationsIds = [];
      const organisationsLength = rules.organisations.length;
      for (let i = 0; i < organisationsLength; i += 1) {
        const item = rules.organisations[i];
        const id = item._id || null;
        if (id === null || organisationsIds.indexOf(id) === -1) {
          if (id !== null) {
            organisationsIds.push(id);
          }
          const key = `organisation-${i}`;
          organisationsItems.push(
            <Block
              key={key}
              item={item}
              type="organisation"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputOrganisations = (
        <div className="import-plan-preview-entities" key="organisations-block">
          <div className="import-plan-preview-entities-items organisations">
            {organisationsItems}
          </div>
        </div>
      );
      newBlocks.push(outputOrganisations);
    }
    if (rules.resources.length > 0) {
      const resourcesItems = [];
      const resourcesIds = [];
      const resourcesLength = rules.resources.length;
      for (let i = 0; i < resourcesLength; i += 1) {
        const item = rules.resources[i];
        const id = item._id || null;
        if (id === null || resourcesIds.indexOf(id) === -1) {
          if (id !== null) {
            resourcesIds.push(id);
          }
          const key = `resource-${i}`;
          resourcesItems.push(
            <Block
              key={key}
              item={item}
              type="resource"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputResources = (
        <div className="import-plan-preview-entities" key="resources-block">
          <div className="import-plan-preview-entities-items resources">
            {resourcesItems}
          </div>
        </div>
      );
      newBlocks.push(outputResources);
    }
    if (rules.spatials.length > 0) {
      const spatialsItems = [];
      const spatialsIds = [];
      const spatialsLength = rules.spatials.length;
      for (let i = 0; i < spatialsLength; i += 1) {
        const item = rules.spatials[i];
        const id = item._id || null;
        if (id === null || spatialsIds.indexOf(id) === -1) {
          if (id !== null) {
            spatialsIds.push(id);
          }
          const key = `spatial-${i}`;
          spatialsItems.push(
            <Block
              key={key}
              item={item}
              type="spatial"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputSpatials = (
        <div className="import-plan-preview-entities" key="spatials-block">
          <div className="import-plan-preview-entities-items spatials">
            {spatialsItems}
          </div>
        </div>
      );
      newBlocks.push(outputSpatials);
    }
    if (rules.temporals.length > 0) {
      const temporalsItems = [];
      const temporalsIds = [];
      const temporalsLength = rules.temporals.length;
      for (let i = 0; i < temporalsLength; i += 1) {
        const item = rules.temporals[i];
        const id = item._id || null;
        if (id === null || temporalsIds.indexOf(id) === -1) {
          if (id !== null) {
            temporalsIds.push(id);
          }
          const key = `temporal-${i}`;
          temporalsItems.push(
            <Block
              key={key}
              item={item}
              type="temporal"
              index={i}
              rowKey={rowKey}
              select={updateSelectedBlock}
              selectedBlocks={selectedBlocks}
            />
          );
        }
      }
      outputTemporals = (
        <div className="import-plan-preview-entities" key="temporals-block">
          <div className="import-plan-preview-entities-items temporals">
            {temporalsItems}
          </div>
        </div>
      );
      newBlocks.push(outputTemporals);
    }
    setBlocks(newBlocks);
  }, [rules, rowKey, selectedBlocks, updateSelectedBlock]);

  const countRelations = useCallback(
    (srcId = null, rowRelations = []) => {
      let count = 0;
      if (srcId !== null) {
        const itemRelations = rowRelations.filter((r) => r.srcId === srcId);
        const targetIds = itemRelations.map((ir) => ir.targetId);
        const eventTargetIds =
          rules.events.filter((r) => targetIds.indexOf(r.refId) > -1) || [];
        const organisationsTargetIds =
          rules.organisations.filter((r) => targetIds.indexOf(r.refId) > -1) ||
          [];
        const peopleTargetIds =
          rules.people.filter((r) => targetIds.indexOf(r.refId) > -1) || [];
        const resourcesTargetIds =
          rules.resources.filter((r) => targetIds.indexOf(r.refId) > -1) || [];
        const spatialsTargetIds =
          rules.spatials.filter((r) => targetIds.indexOf(r.refId) > -1) || [];
        const temporalsTargetIds =
          rules.temporals.filter((r) => targetIds.indexOf(r.refId) > -1) || [];
        count =
          eventTargetIds.length +
          organisationsTargetIds.length +
          peopleTargetIds.length +
          resourcesTargetIds.length +
          spatialsTargetIds.length +
          temporalsTargetIds.length;
      }
      return count;
    },
    [rules]
  );

  const renderRelations = useCallback(() => {
    svgLinesH = [];
    svgLinesV = [];
    const newOutput = [];
    const rowRelations =
      relations.find((r) => r.row === rowKey)?.relations || [];
    const rLength = rowRelations.length;
    for (let i = 0; i < rLength; i += 1) {
      const r = rowRelations[i];
      const { label, srcId, targetId, srcType, role = '' } = r;
      const count = countRelations(srcId, rowRelations) || 0;

      const elemSrcId = `${rowKey}.${srcId}`;
      const elemTargetId = `${rowKey}.${targetId}`;
      const srcElement = document.getElementById(elemSrcId) || null;
      const targetElement = document.getElementById(elemTargetId) || null;
      if (srcElement !== null && targetElement !== null) {
        const key = `${i}.${rowKey}.${elemSrcId}.${elemTargetId}`;
        const newLine = (
          <SVGLine
            rowKey={rowKey}
            key={key}
            label={label}
            srcId={elemSrcId}
            targetId={elemTargetId}
            srcType={srcType}
            count={count}
            role={role}
            selectedBlocks={selectedBlocks}
            selectedBlock={selectedBlock}
          />
        );
        newOutput.push(newLine);
      }
    }
    setRelationsOutput(newOutput);
  }, [relations, rowKey, countRelations, selectedBlocks, selectedBlock]);

  useEffect(() => {
    let timeout = null;
    if (rules !== null && !renderComplete) {
      render();
      timeout = setTimeout(() => {
        setRenderComplete(true);
      }, 1000);
    }
    return () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [rules, render, renderComplete]);

  useEffect(() => {
    if (renderComplete && blocks.length > 0) {
      renderRelations();
    }
    window.addEventListener('resize', renderRelations);
    return () => {
      window.removeEventListener('resize', renderRelations);
    };
  }, [renderComplete, renderRelations, blocks]);

  useEffect(() => {
    render();
  }, [selectedBlocks, render]);

  const updateZoom = (value) => {
    let newScale = parseFloat(scale, 10).toFixed(1);
    if (value === 'plus') {
      if (newScale < 2) {
        newScale = parseFloat(newScale, 10) + 0.1;
      }
    }
    if (value === 'minus') {
      if (newScale > 0.1) {
        newScale = parseFloat(newScale, 10) - 0.1;
      }
    }
    setScale(newScale);
    setTimeout(() => {
      const height =
        entitiesContainer !== null && entitiesContainer.current !== null
          ? entitiesContainer.current.getBoundingClientRect().height
          : 'auto';
      setContainerHeight(height);
    }, 300);
  };

  const zoomPanel = (
    <div className="zoom-container preview-data-zoom-container">
      <div
        className="zoom-action"
        onClick={() => updateZoom('plus')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="select event"
      >
        <i className="fa fa-plus" />
      </div>
      <div
        className="zoom-action"
        onClick={() => updateZoom('minus')}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="select event"
      >
        <i className="fa fa-minus" />
      </div>
    </div>
  );

  const containerStyle = {
    transform: `scale(${scale})`,
  };

  return (
    <div
      style={{ height: containerHeight }}
      className="import-plan-preview-entities-wrapper"
    >
      {zoomPanel}
      <div className="import-plan-preview-row-container">
        <div
          ref={entitiesContainer}
          className="import-plan-preview-entities-container"
          id={`import-plan-preview-entities-container-${rowKey}`}
          style={containerStyle}
        >
          {relationsOutput}
          {blocks}
        </div>
      </div>
    </div>
  );
}
ImportPlanPreviewEntities.defaultProps = {
  rules: null,
  relations: [],
  rowKey: '',
};
ImportPlanPreviewEntities.propTypes = {
  rules: PropTypes.object,
  relations: PropTypes.array,
  rowKey: PropTypes.number,
};
export default ImportPlanPreviewEntities;
