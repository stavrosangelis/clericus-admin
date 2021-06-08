import React, { Component } from 'react';
import { Label, Input, FormGroup } from 'reactstrap';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

let canvas;
let ctx;
let nodes;
let links;
let sizeRatio;
let width;
let height;
let edgesType;
let edgesLabels;
let transform = { k: 1, x: 0, y: 0 };

const calcNodeSize = (size, newSizeRatio) => {
  // min: 1.7 max: 5
  let newSize = parseFloat(newSizeRatio, 10) * parseInt(size, 10);
  if (newSize < 1.7) {
    newSize = 1.7;
  }
  return newSize * 15;
};

const drawNodes = (coords) => {
  const nodesCount = d3.select('#nodes-count');
  if (nodesCount.html() === '') {
    nodesCount.html(nodes.length);
  }
  const lx = coords.x;
  const ty = coords.y;
  const scale = coords.k;
  const sizes = nodes.map((n) => n.size);
  const maxSize = Math.max(...sizes);
  sizeRatio = 3 / maxSize;
  for (let i = 0; i < nodes.length; i += 1) {
    const d = nodes[i];
    d.visible = false;
    d.radius = calcNodeSize(d.size, sizeRatio);
    let { radius } = d;
    const { x } = d;
    const { y } = d;
    const newX = lx + x * scale;
    const newY = ty + y * scale;
    if (newX > 0 && newX < width && newY > 0 && newY < height) {
      d.visible = true;
      const labelRows = d.label.split(' ').filter((j) => j !== '');
      ctx.beginPath();
      // circle
      if (typeof d.selected !== 'undefined' && d.selected) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#33729f';
        radius += 5;
      } else if (typeof d.associated !== 'undefined' && d.associated) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = d.strokeColor;
      } else {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = d.strokeColor;
      }
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = d.color;
      ctx.fill();
      ctx.stroke();
      const textX = x;
      let textY = y;
      const { length } = labelRows;
      if (length > 2) {
        textY -= 6;
      }
      for (let t = 0; t < labelRows.length; t += 1) {
        const label = labelRows[t];
        ctx.fillStyle = '#333333';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'Top';
        ctx.fillText(label, textX, textY);
        textY += 10;
      }

      ctx.closePath();
    }
  }
};

const drawLines = (coords) => {
  const coordsX = coords.x;
  const coordsY = coords.y;
  const scale = coords.k;
  if (edgesType === 'simple') {
    const compare = [];
    const newLinks = [];
    for (let i = 0; i < links.length; i += 1) {
      const item = links[i];
      const nodesCopy = `${item.source.index},${item.target.index}`;
      if (compare.indexOf(nodesCopy) === -1) {
        compare.push(nodesCopy);
        newLinks.push(item);
      }
    }
    links = newLinks;
  }
  const linksCount = d3.select('#links-count');
  if (linksCount.html() === '') {
    linksCount.html(links.length);
  }
  const pairs = [];
  for (let i = 0; i < links.length; i += 1) {
    const d = links[i];
    let sx = d.source.x;
    let sy = d.source.y;
    let tx = d.target.x;
    let ty = d.target.y;

    let inverse = false;
    const pair = `${d.source.index},${d.target.index}`;
    const inversePair = `${d.target.index},${d.source.index}`;
    if (pairs.indexOf(pair) > -1 || pairs.indexOf(inversePair) > -1) {
      inverse = true;
    } else {
      pairs.push(pair);
      pairs.push(inversePair);
    }
    // fix source direction
    if (inverse) {
      let origin = links.find(
        (l) =>
          l.source.index === d.source.index &&
          l.target.index === d.target.index &&
          l.index !== d.index
      );
      if (typeof origin === 'undefined') {
        origin = links.find(
          (l) =>
            l.source.index === d.target.index &&
            l.target.index === d.source.index &&
            l.index !== d.index
        );
      }
      if (typeof origin !== 'undefined') {
        if (sx !== origin.source.x && sy !== origin.source.y) {
          sx = origin.source.x;
          sy = origin.source.y;
          tx = origin.target.x;
          ty = origin.target.y;
        }
      }
    }

    const newX = coordsX + sx * scale;
    const newY = coordsY + sy * scale;
    if (newX > 0 && newX < width && newY > 0 && newY < height) {
      if (edgesType === 'simple' && !inverse) {
        ctx.beginPath();
        ctx.moveTo(d.source.x, d.source.y);
        ctx.lineTo(d.target.x, d.target.y);
        if (typeof d.associated !== 'undefined' && d.associated) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#33729f';
        } else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#999';
        }
        if (edgesLabels === 'visible') {
          const nsx = d.source.x;
          const nsy = d.source.y;
          const ntx = d.target.x;
          const nty = d.target.y;
          let lineWidth = 0;
          let lineHeight = 0;
          let textX = 0;
          let textY = 0;
          let smallX;
          let smallY;
          if (nsx > ntx) {
            smallX = ntx;
            lineWidth = nsx - ntx;
          } else {
            smallX = nsx;
            lineWidth = ntx - nsx;
          }
          textX = smallX + lineWidth / 2;
          if (nsy > nty) {
            smallY = nty;
            lineHeight = nsy - nty;
          } else {
            smallY = nsy;
            lineHeight = nty - nsy;
          }
          textY = smallY + lineHeight / 2;
          ctx.fillSntyle = '#666';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(d.label, textX, textY);
        }
        ctx.stroke();
        ctx.closePath();
      }
      if (edgesType === 'double') {
        let mx = 0;
        let my = 0;
        let middlePointX = 0;
        let middlePointY = 0;
        const tension = 50;
        if (sx <= tx) {
          middlePointX = (tx - sx) / 2;
        } else {
          middlePointX = (sx - tx) / 2;
        }
        if (sy <= ty) {
          middlePointY = (ty - sy) / 2;
        } else {
          middlePointY = (sy - ty) / 2;
        }
        if (middlePointX < tension) middlePointX = tension;
        if (middlePointY < tension) middlePointY = tension;
        if (inverse) {
          if (sx <= tx && sy <= ty) {
            mx = sx + middlePointX / 2;
            my = ty - middlePointY / 2;
          }
          if (sx > tx && sy < ty) {
            mx = sx - middlePointX / 2;
            my = ty - middlePointY / 2;
          }
          if (sx > tx && sy > ty) {
            mx = tx + middlePointX / 2;
            my = sy - middlePointY / 2;
          }
          if (sx < tx && sy > ty) {
            mx = sx + middlePointX / 2;
            my = ty + middlePointY / 2;
          }
        } else {
          if (sx <= tx && sy <= ty) {
            mx = tx - middlePointX / 2;
            my = sy + middlePointY / 2;
          }
          if (sx > tx && sy < ty) {
            mx = tx + middlePointX / 2;
            my = sy + middlePointY / 2;
          }
          if (sx > tx && sy > ty) {
            mx = sx - middlePointX / 2;
            my = ty + middlePointY / 2;
          }
          if (sx < tx && sy > ty) {
            mx = tx - middlePointX / 2;
            my = sy - middlePointY / 2;
          }
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(mx, my, tx, ty);
        if (typeof d.associated !== 'undefined' && d.associated) {
          ctx.lineWidth = 3;
          if (inverse) ctx.strokeStyle = '#36af50';
          else ctx.strokeStyle = '#33729f';
        } else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#999';
        }
        if (edgesLabels === 'visible') {
          let textColor = '#666';
          let fontStyle = '9px sans-serif';
          if (typeof d.associated !== 'undefined' && d.associated) {
            if (inverse) {
              textColor = '#36af50';
            } else {
              textColor = '#33729f';
            }
            fontStyle = 'bold 9px sans-serif';
          }
          ctx.fillStyle = textColor;
          ctx.font = fontStyle;
          ctx.textAlign = 'center';
          ctx.fillText(d.label, mx, my);
        }
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
};

const zoomedEnd = async () => {
  if (d3.event !== null && d3.event.transform !== null) {
    transform = d3.event.transform;
  }
  const scale = transform.k;
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.translate(transform.x, transform.y);
  ctx.scale(scale, scale);
  drawLines(transform);
  drawNodes(transform);
  ctx.restore();
};

const zoomHandler = d3.zoom().scaleExtent([0.1, 8]).on('zoom', zoomedEnd);

class NetworkGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsVisible: false,
      edgesType: 'simple',
      edgesLabels: 'visible',
      d: null,
      associatedNodes: [],
      associatedLinks: [],
    };

    this.drawGraph = this.drawGraph.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.selectedNodes = this.selectedNodes.bind(this);
    this.clearAssociated = this.clearAssociated.bind(this);
  }

  componentDidMount() {
    const { data } = this.props;
    if (data !== null) {
      this.drawGraph();
    }
    document.addEventListener('click', this.clickNode);
  }

  componentDidUpdate(prevProps) {
    const {
      data,
      relatedNodes,
      clearAssociated: clearAssociatedBool,
      width: propsWidth,
      height: propsHeight,
    } = this.props;
    if (data !== null && prevProps.data !== data) {
      this.drawGraph();
    }

    if (relatedNodes.length > 0 && prevProps.relatedNodes !== relatedNodes) {
      this.selectedNodes();
    }
    if (clearAssociatedBool) {
      this.clearAssociated();
    }
    if (
      (prevProps.width > 0 && prevProps.width !== propsWidth) ||
      (prevProps.height > 0 && prevProps.height !== propsHeight)
    ) {
      this.updateDimensions();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.clickNode);
  }

  handleChange(e) {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState(
      {
        [name]: value,
      },
      () => {
        this.drawGraph();
      }
    );
  }

  drawGraph() {
    const { data, width: propsWidth, height: propsHeight } = this.props;
    const {
      edgesType: stateEdgesType,
      edgesLabels: stateEdgesLabels,
    } = this.state;
    if (data === null) {
      return false;
    }
    width = propsWidth;
    height = propsHeight;
    edgesType = stateEdgesType;
    edgesLabels = stateEdgesLabels;

    const container = d3.select('#network-graph');
    container.html('');

    canvas = container
      .append('canvas')
      .attr('id', 'visualisation-canvas')
      .attr('width', width)
      .attr('height', height);

    ctx = canvas.node().getContext('2d');

    nodes = data.nodes.map((d) => Object.create(d));
    links = data.links.map((d) => Object.create(d));

    const strength = -400;
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .strength(1)
          .distance(200)
      )
      .force('charge', d3.forceManyBody().strength(strength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(60))
      .stop();

    // control ticks aka performance trick
    const iterations = 100;
    const threshold = 0.001;
    simulation.restart();
    for (let i = iterations; i > 0; i -= 1) {
      simulation.tick();
      if (simulation.alpha() < threshold) {
        break;
      }
    }
    simulation.stop();

    d3.select('#graph-zoom-in').on('click', () => {
      zoomHandler.scaleBy(canvas, 1.25);
    });
    d3.select('#graph-zoom-out').on('click', () => {
      zoomHandler.scaleBy(canvas, 0.75);
    });
    d3.select('#graph-pan-up').on('click', () => {
      const currentTransform = d3.zoomTransform(canvas);
      const newX = currentTransform.x;
      const newY = currentTransform.y - 50;
      zoomHandler.translateBy(canvas, newX, newY);
    });
    d3.select('#graph-pan-right').on('click', () => {
      const currentTransform = d3.zoomTransform(canvas);
      const newX = currentTransform.x + 50;
      const newY = currentTransform.y;
      zoomHandler.translateBy(canvas, newX, newY);
    });
    d3.select('#graph-pan-down').on('click', () => {
      const currentTransform = d3.zoomTransform(canvas);
      const newX = currentTransform.x;
      const newY = currentTransform.y + 50;
      zoomHandler.translateBy(canvas, newX, newY);
    });
    d3.select('#graph-pan-left').on('click', () => {
      const currentTransform = d3.zoomTransform(canvas);
      const newX = currentTransform.x - 50;
      const newY = currentTransform.y;
      zoomHandler.translateBy(canvas, newX, newY);
    });

    zoomHandler(d3.select(ctx.canvas));
    this.updateDimensions();
    return false;
  }

  async updateDimensions() {
    const { width: newWidth, height: newHeight } = this.props;
    width = newWidth;
    height = newHeight;
    if (ctx.canvas !== null) {
      ctx.save();
      canvas.attr('height', newHeight);
      canvas.attr('width', newWidth);
      ctx.clearRect(0, 0, newWidth, newHeight);
      ctx.translate(0, 0);
      ctx.scale(1, 1);
      drawLines(transform);
      drawNodes(transform);
      ctx.restore();
    }
    zoomedEnd();
  }

  toggleOptions() {
    const { optionsVisible } = this.state;
    this.setState({
      optionsVisible: !optionsVisible,
    });
  }

  clickNode(e) {
    const { clickNode: clickNodeFn } = this.props;
    const { d } = this.state;
    if (e.target.getAttribute('id') !== 'visualisation-canvas') {
      return false;
    }
    const visibleNodes = nodes.filter((n) => n.visible);
    const transformX = transform.x;
    const transformY = transform.y;
    const scale = transform.k;
    const x = e.offsetX / scale;
    const y = e.offsetY / scale;
    // locate node
    const clickedNodes = [];
    for (let i = 0; i < visibleNodes.length; i += 1) {
      const dVisible = visibleNodes[i];
      const { x: dx, y: dy, radius } = dVisible;
      const lx = dx - radius + transformX / scale;
      const rx = dx + radius + transformX / scale;
      const ty = dy - radius + transformY / scale;
      const by = dy + radius + transformY / scale;

      if (x >= lx && x <= rx && y >= ty && y <= by) {
        clickedNodes.push(d);
      }
    }
    clickedNodes.sort((a, b) => {
      const keyA = a.index;
      const keyB = b.index;
      if (keyA > keyB) return -1;
      if (keyA < keyB) return 1;
      return 0;
    });
    let clickedNode = null;
    if (clickedNodes.length > 0) {
      [clickedNode] = clickedNodes;
    } else {
      return false;
    }
    clickedNode.selected = true;
    clickNodeFn(clickedNode.id);
    if (d !== null) {
      const prevNode = nodes.find((n) => n === d);
      if (typeof prevNode !== 'undefined') {
        delete prevNode.selected;
      }
    }
    this.setState({ d: clickedNode });
    return false;
  }

  selectedNodes() {
    const { d } = this.state;
    const { relatedLinks, relatedNodes } = this.props;
    this.clearAssociated();

    // 3. get associated links
    let incomingLinks = links.filter((l) => l.source.id === d.id);
    let outgoingLinks = links.filter((l) => l.target.id === d.id);
    incomingLinks = incomingLinks.map((l) => l.refId);
    outgoingLinks = outgoingLinks.map((l) => l.refId);

    const associatedLinks = incomingLinks.concat(
      outgoingLinks.filter((i) => incomingLinks.indexOf(i) === -1)
    );
    let mergedAssociatedLinks = associatedLinks.concat(
      relatedLinks.filter((i) => associatedLinks.indexOf(i) === -1)
    );
    if (mergedAssociatedLinks.length > 0) {
      mergedAssociatedLinks = Array.from(new Set(mergedAssociatedLinks));
    }

    // 3.3 associate new links
    const associatedNodeIds = [];
    mergedAssociatedLinks.forEach((l) => {
      const link = links.find((i) => i.refId === l);
      link.associated = true;
    });
    const mergedNodesIds = [...associatedNodeIds, ...relatedNodes];
    // 4. get associated nodes
    const associatedNodes = nodes.filter(
      (n) => mergedNodesIds.indexOf(n.id) > -1
    );

    // 4.3 associate new nodes
    for (let i = 0; i < associatedNodes.length; i += 1) {
      const n = associatedNodes[i];
      n.associated = true;
    }
    this.setState({
      associatedNodes,
      associatedLinks: mergedAssociatedLinks,
    });

    const scale = transform.k;
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.translate(transform.x, transform.y);
    ctx.scale(scale, scale);
    drawLines(transform);
    drawNodes(transform);
    ctx.restore();
  }

  clearAssociated() {
    const { associatedNodes } = this.state;
    for (let n = 0; n < associatedNodes.length; n += 1) {
      const item = associatedNodes[n];
      item.associated = false;
      delete item.associated;
    }
    const { associatedLinks } = this.state;
    for (let l = 0; l < associatedLinks.length; l += 1) {
      const item = associatedLinks[l];
      const link = links.find((i) => i.refId === item);
      link.associated = false;
      delete link.associated;
    }
    this.setState({
      associatedNodes: [],
      associatedLinks: [],
    });
  }

  render() {
    const {
      edgesType: stateEdgesType,
      edgesLabels: stateEdgesLabels,
      optionsVisible,
    } = this.state;
    const zoomPanel = (
      <div className="zoom-panel">
        <div id="graph-zoom-in" className="zoom-action">
          <i className="fa fa-plus" />
        </div>
        <div id="graph-zoom-out" className="zoom-action">
          <i className="fa fa-minus" />
        </div>
      </div>
    );

    const panPanel = (
      <div className="pan-container">
        <div className="pan-action up" id="graph-pan-up">
          <i className="fa fa-chevron-up" />
        </div>

        <div className="pan-action right" id="graph-pan-right">
          <i className="fa fa-chevron-right" />
        </div>

        <div className="pan-action down" id="graph-pan-down">
          <i className="fa fa-chevron-down" />
        </div>

        <div className="pan-action left" id="graph-pan-left">
          <i className="fa fa-chevron-left" />
        </div>
      </div>
    );

    let edgesType0 = true;
    let edgesType1 = false;
    let edgesLabels0 = true;
    let edgesLabels1 = false;
    if (stateEdgesType === 'double') {
      edgesType0 = false;
      edgesType1 = true;
    }
    if (stateEdgesLabels === 'visible') {
      edgesLabels0 = false;
      edgesLabels1 = true;
    }

    const optionsVisibleClass = optionsVisible ? ' visible' : '';

    const optionsPanel = (
      <div className="options-container">
        <div
          className="options-trigger"
          onClick={() => this.toggleOptions()}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="trigger options"
        >
          <i className="fa fa-cog" />
        </div>
        <div className={`options-panel${optionsVisibleClass}`}>
          <div className="options-panel-body">
            <div className="option">
              <Label>Edges type</Label>
              <FormGroup>
                <Label>
                  <Input
                    type="radio"
                    name="edgesType"
                    value="simple"
                    onChange={this.handleChange}
                    checked={edgesType0}
                  />{' '}
                  Simple edges
                </Label>
              </FormGroup>
              <FormGroup>
                <Label>
                  <Input
                    type="radio"
                    name="edgesType"
                    value="double"
                    onChange={this.handleChange}
                    checked={edgesType1}
                  />{' '}
                  Two-directional edges*
                </Label>
              </FormGroup>
            </div>
            <div className="option">
              <Label>Edges labels</Label>
              <FormGroup>
                <Label>
                  <Input
                    type="radio"
                    name="edgesLabels"
                    value="hidden"
                    onChange={this.handleChange}
                    checked={edgesLabels0}
                  />{' '}
                  Hidden
                </Label>
              </FormGroup>
              <FormGroup>
                <Label>
                  <Input
                    type="radio"
                    name="edgesLabels"
                    value="visible"
                    onChange={this.handleChange}
                    checked={edgesLabels1}
                  />{' '}
                  Visible*
                </Label>
              </FormGroup>
              <div className="info">*May affect performance</div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div>
        <div>
          Nodes: <span id="nodes-count" /> | Links: <span id="links-count" />
        </div>
        <div id="network-graph" />
        <div className="graph-actions">
          {panPanel}
          {zoomPanel}
          {optionsPanel}
        </div>
      </div>
    );
  }
}

NetworkGraph.defaultProps = {
  data: [],
  relatedNodes: [],
  relatedLinks: [],
  clearAssociated: false,
  width: 0,
  height: 0,
  clickNode: () => {},
};

NetworkGraph.propTypes = {
  data: PropTypes.array,
  relatedNodes: PropTypes.array,
  relatedLinks: PropTypes.array,
  clearAssociated: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  clickNode: PropTypes.func,
};

export default NetworkGraph;
