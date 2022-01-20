import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const outputItem = (item) => {
  const output = [];
  Object.keys(item).forEach((v, i) => {
    if (item[v] !== null && item[v] !== '') {
      const key = `${v}.${i}`;
      let outputValue = typeof item[v] !== 'string' ? [] : item[v];
      if (Array.isArray(item[v]) && item[v].length > 0) {
        outputValue =
          item[v].map((o, j) => {
            const cbkey = `${key}.${j}`;
            const newItemRows = [];
            let newItem = o;
            let isJSON = false;
            if (
              newItem !== null &&
              newItem !== '' &&
              typeof newItem === 'string'
            ) {
              try {
                newItem = JSON.parse(o);
                isJSON = true;
              } catch (e) {
                newItem = o;
              }
            }
            if (isJSON) {
              const objKeys = Object.keys(newItem);
              objKeys.forEach((objKey) => {
                if (newItem[objKey] !== '') {
                  const value =
                    typeof newItem[objKey] === 'string'
                      ? newItem[objKey]
                      : Object.keys(newItem[objKey]).map((ok) => (
                          <div className="child-item" key={ok}>
                            <b>{ok}</b>: {newItem[objKey][ok]}
                          </div>
                        ));
                  const newItemRow = (
                    <div className="child-item" key={objKey}>
                      <b>{objKey}</b>: {value}
                    </div>
                  );
                  newItemRows.push(newItemRow);
                }
              });
            } else if (typeof o === 'object') {
              const oOutput = outputItem(o);
              output.push(
                <div key={cbkey}>
                  <b>{v}</b>:<div className="child-item">{oOutput}</div>
                </div>
              );
            } else if (o !== '') {
              output.push(
                <div key={cbkey}>
                  <b>{v}</b>: {o}
                </div>
              );
            }
            return (
              <div key={cbkey} className="children-block">
                {newItemRows}
              </div>
            );
          }) || [];
      }
      if (
        v !== 'row' &&
        v !== 'refId' &&
        outputValue.length > 0 &&
        !Array.isArray(outputValue)
      ) {
        output.push(
          <div key={key}>
            <b>{v}</b>: {outputValue}
          </div>
        );
      }
    }
  });
  return output;
};

const Block = (props) => {
  const { item, rowKey } = props;
  const output = outputItem(item);

  return (
    <div className="import-plan-preview-entity" id={`${rowKey}.${item.refId}`}>
      {output}
    </div>
  );
};
Block.propTypes = {
  item: PropTypes.object.isRequired,
  rowKey: PropTypes.number.isRequired,
};

const SVGLine = (props) => {
  const { srcId, targetId, srcType, rowKey } = props;
  const srcElement = document.getElementById(srcId) || null;
  const targetElement = document.getElementById(targetId) || null;
  if (srcElement !== null && targetElement !== null) {
    const {
      x: sx,
      y: sy,
      width: swidth,
      height: sheight,
    } = srcElement.getBoundingClientRect();
    const x1 = sx + swidth / 2;
    const y1 = sy + sheight / 2;
    const {
      x: tx,
      y: ty,
      width: twidth,
      height: theight,
    } = targetElement.getBoundingClientRect();
    const x2 = tx + twidth / 2;
    const y2 = ty + theight / 2;
    const container = document.getElementById(
      `import-plan-preview-entities-container-${rowKey}`
    );
    const {
      x: cx,
      y: cy,
      width: cwidth,
      height: cheight,
    } = container.getBoundingClientRect();
    let color = '#f7a96a';
    if (srcType === 'Event') {
      color = '#F9CD1B';
    } else if (srcType === 'Organisation') {
      color = '#9B8CF2';
    } else if (srcType === 'Person') {
      color = '#5DC910';
    } else if (srcType === 'Resource') {
      color = '#00CBFF';
    } else if (srcType === 'Spatial') {
      color = '#875d1f';
    } else if (srcType === 'Temporal') {
      color = '#2eeace';
    }
    return (
      <svg
        className="svg-container"
        viewBox={`${cx} ${cy} ${cwidth} ${cheight}`}
        data-src={srcId}
        data-target={targetId}
      >
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" />
      </svg>
    );
  }
  return [];
};
SVGLine.propTypes = {
  srcId: PropTypes.string.isRequired,
  srcType: PropTypes.string.isRequired,
  targetId: PropTypes.string.isRequired,
};

const ImportPlanPreviewEntities = (props) => {
  const { rules, relations, rowKey } = props;
  const [renderComplete, setRenderComplete] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [relationsOutput, setRelationsOutput] = useState([]);

  const render = useCallback(() => {
    const newBlocks = [];
    let outputPeople = [];
    let outputEvents = [];
    let outputOrganisations = [];
    let outputResources = [];
    let outputSpatials = [];
    let outputTemporals = [];
    if (rules.people.length > 0) {
      const peopleItems = rules.people.map((p, i) => {
        const key = `person-${i}`;
        return <Block key={key} item={p} index={i} rowKey={rowKey} />;
      });
      outputPeople = (
        <div className="import-plan-preview-entities" key="people-block">
          <div className="heading">People</div>
          <div className="import-plan-preview-entities-items people">
            {peopleItems}
          </div>
        </div>
      );
      newBlocks.push(outputPeople);
    }
    if (rules.events.length > 0) {
      const eventsItems = rules.events.map((e, i) => {
        const key = `event-${i}`;
        return <Block key={key} item={e} index={i} rowKey={rowKey} />;
      });
      outputEvents = (
        <div className="import-plan-preview-entities" key="events-block">
          <div className="heading">Events</div>
          <div className="import-plan-preview-entities-items events">
            {eventsItems}
          </div>
        </div>
      );
      newBlocks.push(outputEvents);
    }
    if (rules.organisations.length > 0) {
      const organisationsItems = rules.organisations.map((o, i) => {
        const key = `organisation-${i}`;
        return <Block key={key} item={o} index={i} rowKey={rowKey} />;
      });
      outputOrganisations = (
        <div className="import-plan-preview-entities" key="organisations-block">
          <div className="heading">Organisations</div>
          <div className="import-plan-preview-entities-items organisations">
            {organisationsItems}
          </div>
        </div>
      );
      newBlocks.push(outputOrganisations);
    }
    if (rules.resources.length > 0) {
      const resourcesItems = rules.resources.map((r, i) => {
        const key = `resource-${i}`;
        return <Block key={key} item={r} index={i} rowKey={rowKey} />;
      });
      outputResources = (
        <div className="import-plan-preview-entities" key="resources-block">
          <div className="heading">Resources</div>
          <div className="import-plan-preview-entities-items resources">
            {resourcesItems}
          </div>
        </div>
      );
      newBlocks.push(outputResources);
    }
    if (rules.spatials.length > 0) {
      const spatialsItems = rules.spatials.map((s, i) => {
        const key = `spatial-${i}`;
        return <Block key={key} item={s} index={i} rowKey={rowKey} />;
      });
      outputSpatials = (
        <div className="import-plan-preview-entities" key="spatials-block">
          <div className="heading">Spatials</div>
          <div className="import-plan-preview-entities-items spatials">
            {spatialsItems}
          </div>
        </div>
      );
      newBlocks.push(outputSpatials);
    }
    if (rules.temporals.length > 0) {
      const temporalsItems = rules.temporals.map((t, i) => {
        const key = `temporal-${i}`;
        return <Block key={key} item={t} index={i} rowKey={rowKey} />;
      });
      outputTemporals = (
        <div className="import-plan-preview-entities" key="temporals-block">
          <div className="heading">Temporals</div>
          <div className="import-plan-preview-entities-items temporals">
            {temporalsItems}
          </div>
        </div>
      );
      newBlocks.push(outputTemporals);
    }
    setBlocks(newBlocks);
  }, [rules, rowKey]);

  const renderRelations = useCallback(() => {
    const newOutput = [];
    const rowRelations =
      relations.find((r) => r.row === rowKey)?.relations || [];
    const rLength = rowRelations.length;
    for (let i = 0; i < rLength; i += 1) {
      const r = rowRelations[i];
      const { srcId, targetId, srcType } = r;
      const elemSrcId = `${rowKey}.${srcId}`;
      const elemTargetId = `${rowKey}.${targetId}`;
      const srcElement = document.getElementById(elemSrcId) || null;
      const targetElement = document.getElementById(elemTargetId) || null;
      if (srcElement !== null && targetElement !== null) {
        const key = `${rowKey}.${elemSrcId}.${elemTargetId}`;
        const newLine = (
          <SVGLine
            rowKey={rowKey}
            key={key}
            srcId={elemSrcId}
            targetId={elemTargetId}
            srcType={srcType}
          />
        );
        newOutput.push(newLine);
      }
    }
    setRelationsOutput(newOutput);
  }, [relations, rowKey]);

  useEffect(() => {
    if (rules !== null && !renderComplete) {
      render();
      setTimeout(() => {
        setRenderComplete(true);
      }, 1000);
    }
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

  return (
    <div
      className="import-plan-preview-entities-container"
      id={`import-plan-preview-entities-container-${rowKey}`}
    >
      {relationsOutput}
      {blocks}
    </div>
  );
};
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
