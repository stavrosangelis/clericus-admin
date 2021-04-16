import React, { Component } from 'react';
import { Label, Input, FormGroup, Spinner } from 'reactstrap';
import * as d3 from 'd3';
import PropTypes from 'prop-types';

// d3 functions
const calcNodeSize = (size, sizeRatio) => {
  // min: 1.7 max: 5
  let newSize = parseFloat(sizeRatio, 10) * parseInt(size, 10);
  if (newSize < 1.7) {
    newSize = 1.7;
  }
  return newSize * 10;
};

const toggleVisibleNodes = (coords, width, height) => {
  let widthCopy = width;
  let heightCopy = height;
  if (typeof widthCopy === 'string') {
    widthCopy = widthCopy.replace('px', '');
    widthCopy = parseInt(widthCopy, 10);
  }
  if (typeof heightCopy === 'string') {
    heightCopy = heightCopy.replace('px', '');
    heightCopy = parseInt(heightCopy, 10);
  }
  const lx = coords.x;
  const ty = coords.y;
  const scale = coords.k;

  d3.selectAll('g.network-node').attr('visibility', (d) => {
    let visibility = 'hidden';
    const newX = lx + d.x * scale;
    const newY = ty + d.y * scale;
    if (newX > 0 && newX < widthCopy && newY > 0 && newY < heightCopy) {
      visibility = 'visible';
    }
    return visibility;
  });
  d3.selectAll('line.network-line').attr('visibility', (d) => {
    let visibility = 'hidden';
    const newX = lx + d.source.x * scale;
    const newY = ty + d.source.y * scale;
    if (newX > 0 && newX < widthCopy && newY > 0 && newY < heightCopy) {
      visibility = 'visible';
    }
    return visibility;
  });
};

const zoomedStart = () => {
  // 1. hide edges and edge labels
  d3.selectAll('.network-line').attr('visibility', 'hidden');
  d3.selectAll('.network-line-path').attr('visibility', 'hidden');
  d3.selectAll('.network-text').attr('visibility', 'hidden');
};

const zoomed = () => {
  const g = document.getElementsByClassName('zoom-container')[0];
  // 1. hide edges and edge labels
  d3.selectAll('.network-line').attr('visibility', 'hidden');
  d3.selectAll('.network-line-path').attr('visibility', 'hidden');
  d3.selectAll('.network-text').attr('visibility', 'hidden');

  // 2. apply transformation
  g.setAttribute('transform', d3.event.transform.toString());
};

const zoomedEnd = async () => {
  const coords = d3.event.transform;
  const svg = d3.select('#visualisation-svg');
  const width = svg.style('width');
  const height = svg.style('height');
  // d3.selectAll(".network-line-path").attr("visibility", "visible");
  // d3.selectAll(".network-text").attr("visibility", "visible");
  toggleVisibleNodes(coords, width, height);
};

const zoomHandler = d3
  .zoom()
  .scaleExtent([0.1, 8])
  .on('start', zoomedStart)
  .on('zoom', zoomed)
  .on('end', zoomedEnd);

const drawCircles = (g, nodes, batchSize, clickNode, width, height) => {
  const coords = d3.zoomTransform(g);
  const lx = coords.x;
  const ty = coords.y;
  document.getElementById('nodes-count').innerHTML = nodes.length;
  return new Promise((resolve) => {
    const sizes = nodes.map((n) => n.count);
    const maxSize = Math.max(...sizes);
    const sizeRatio = 3 / maxSize;
    const node = g.selectAll('g.network-node');

    const drawBatch = (batchNumber) => {
      const startIndex = batchNumber * batchSize;
      const stopIndex = Math.min(nodes.length, startIndex + batchSize);
      const nodeData = nodes.slice(startIndex, stopIndex);

      const wrapper = node
        .data(nodeData)
        .enter()
        .append('g')
        .attr('class', 'network-node')
        .attr('id', (d) => `node-${d.id}`)
        .on('click', (d) => {
          clickNode(d);
        })
        .attr('transform', (d) => `translate(${d.x},${d.y})`)
        .attr('visibility', (d) => {
          let visibility = 'hidden';
          const newX = lx + d.x;
          const newY = ty + d.y;
          if (newX > 0 && newX < width && newY > 0 && newY < height) {
            visibility = 'visible';
          }
          return visibility;
        });

      wrapper
        .append('circle')
        .attr('stroke', (d) => d.strokeColor)
        .attr('stroke-width', 0.5)
        .attr('r', (d) => calcNodeSize(d.count, sizeRatio))
        .attr('fill', (d) => d.color)
        .attr('class', 'network-circle');

      wrapper.append('clipPath').attr('id', (d) => `clip-path-${d.id}`);

      wrapper
        .append('text')
        .attr('clip-path', (d) => `clip-path-${d.id}`)
        .selectAll('tspan')
        .data((d) => d.label.split(' '))
        .join('tspan')
        .attr('text-anchor', 'middle')
        .attr('font-size', '4.5pt')
        .attr('font-family', 'sans-serif')
        .attr('fill', '#fff')
        .attr('x', 0)
        .attr('y', (d, i, n) => {
          const y = `${i - n.length / 2 + 0.6}em`;
          return y;
        })
        .text((d) => d);

      if (stopIndex >= nodes.length) {
        resolve(true);
      } else {
        setTimeout(drawBatch(batchNumber + 1), 0);
      }
    };
    setTimeout(drawBatch(0), 0);
  });
};

const drawLinks = (
  g,
  links,
  batchSize,
  edgesType,
  edgesLabels,
  width,
  height
) => {
  let linksCopy = links;
  const coords = d3.zoomTransform(g);
  const lx = coords.x;
  const ty = coords.y;
  return new Promise((resolve) => {
    let link = g.selectAll('line.network-line');
    if (edgesType === 'simple') {
      const compare = [];
      const newLinks = [];
      for (let i = 0; i < linksCopy.length; i += 1) {
        const item = linksCopy[i];
        const nodes = `${item.source.index},${item.target.index}`;
        if (compare.indexOf(nodes) === -1) {
          compare.push(nodes);
          newLinks.push(item);
        }
      }
      linksCopy = newLinks;
    }
    document.getElementById('linksCopy-count').innerHTML = linksCopy.length;
    if (edgesType === 'double') {
      link = g.selectAll('path');
    }
    const linkLabel = g.selectAll('.network-line-path');
    const linkText = g.selectAll('.network-text');
    const marker = g.append('svg:defs').selectAll('marker');
    const drawBatch = (batchNumber) => {
      const startIndex = batchNumber * batchSize;
      const stopIndex = Math.min(linksCopy.length, startIndex + batchSize);
      const linksCopyData = linksCopy.slice(startIndex, stopIndex);
      if (edgesType === 'simple') {
        link
          .data(linksCopyData)
          .enter()
          .append('line')
          .attr('class', 'network-line')
          .style('pointer-events', 'none')
          .attr('id', (d) => `link-line-${d.refId}`)
          .attr('stroke-width', 1)
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.9)
          .attr('x1', (d) => d.source.x)
          .attr('y1', (d) => d.source.y)
          .attr('x2', (d) => d.target.x)
          .attr('y2', (d) => d.target.y)
          .attr('visibility', (d) => {
            let visibility = 'hidden';
            const newX = lx + d.source.x;
            const newY = ty + d.source.y;
            if (newX > 0 && newX < width && newY > 0 && newY < height) {
              visibility = 'visible';
            }
            return visibility;
          });

        if (edgesLabels === 'visible') {
          linkLabel
            .data(linksCopyData)
            .enter()
            .append('path')
            .attr('class', 'network-line-path')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', (d) => `link-path-${d.refId}`)
            .style('pointer-events', 'none')
            .attr(
              'd',
              (d) =>
                `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`
            );

          linkText
            .data(linksCopyData)
            .enter()
            .append('text')
            .attr('id', (d) => `link-text-${d.refId}`)
            .attr('class', 'network-text')
            .style('pointer-events', 'none')
            .append('textPath')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .attr('font-size', '5pt')
            .attr('xlink:href', (d) => `#link-path-${d.refId}`)
            .attr('startOffset', '50%')
            .attr('font-family', 'sans-serif')
            .attr('fill', '#666')
            .text((d) => d.label);
        }
      }
      if (edgesType === 'double') {
        link
          .data(linksCopyData)
          .enter()
          .append('g')
          .style('pointer-events', 'none')
          .attr('id', (d) => `link-${d.refId}`)
          .append('path')
          .attr('class', 'network-line')
          .attr('fill', 'none')
          .attr('stroke-width', 1)
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.9)
          .attr('marker-end', 'url(#end)')
          .attr('id', (d) => `link-line-${d.refId}`)
          .style('pointer-events', 'none')
          .attr('d', (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
          });

        // markers
        marker
          .data(['end'])
          .enter()
          .append('svg:marker')
          .attr('id', String)
          .attr('viewBox', '0 -5 10 10')
          .attr('refX', 58)
          .attr('refY', -4.5)
          .attr('markerWidth', 4)
          .attr('markerHeight', 4)
          .attr('orient', 'auto')
          .attr('fill', '#999')
          .style('pointer-events', 'none')
          .append('svg:path')
          .attr('d', 'M0,-5L10,0L0,5');

        if (edgesLabels === 'visible') {
          link
            .append('text')
            .append('textPath')
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .attr('font-size', '4.5pt')
            .attr('class', 'network-text')
            .attr('id', (d) => `link-text-${d.refId}`)
            .attr('xlink:href', (d) => `#link-line-${d.refId}`)
            .attr('startOffset', '50%')
            .attr('font-family', 'sans-serif')
            .attr('fill', '#666')
            .text((d) => d.label);
        }
      }

      if (stopIndex >= linksCopy.length) {
        resolve(true);
      } else {
        setTimeout(drawBatch(batchNumber + 1), 0);
      }
    };
    setTimeout(drawBatch(0), 0);
  });
};

class NetworkGraph extends Component {
  static clearSelected() {
    // 1. revert selected node
    const prev = document.getElementsByClassName('network-node selected')[0];
    if (typeof prev !== 'undefined') {
      const prevCircle = prev.getElementsByTagName('circle')[0];
      const prevColor = prevCircle.getAttribute('prev-stroke');
      const r = prevCircle.getAttribute('r');
      prevCircle.setAttribute('stroke-width', 0.5);
      prevCircle.setAttribute('stroke', prevColor);
      prevCircle.setAttribute('r', parseFloat(r, 10) - 5);
      prev.classList.remove('selected');
    }

    // 2. revert associated links
    const selectedLinks = document.getElementsByClassName(
      'network-line associated'
    );
    if (typeof selectedLinks !== 'undefined' && selectedLinks.length > 0) {
      [...selectedLinks].forEach((line) => {
        if (typeof line !== 'undefined') {
          line.setAttribute('stroke-width', 1);
          line.setAttribute('stroke', '#999');
          line.classList.remove('associated');
        }
      });
    }

    // 3. revert associated nodes
    const selectedNodes = document.getElementsByClassName(
      'network-node associated'
    );
    if (typeof selectedNodes !== 'undefined' && selectedNodes.length > 0) {
      [...selectedNodes].forEach((node) => {
        const circle = node.getElementsByTagName('circle')[0];
        if (typeof circle !== 'undefined') {
          circle.setAttribute('stroke-width', 1);
        }
        node.classList.remove('associated');
      });
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      optionsVisible: false,
      edgesType: 'simple',
      edgesLabels: 'hidden',
      d: null,
    };

    this.drawGraph = this.drawGraph.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.selectedNodes = this.selectedNodes.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
  }

  componentDidMount() {
    const { data } = this.props;
    if (data !== null) {
      this.drawGraph();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      data,
      relatedNodes,
      clearSelected: clearSelectedBool,
      width,
      height,
    } = this.props;
    if (data !== null && prevProps.data !== data) {
      this.drawGraph();
    }

    if (relatedNodes.length > 0 && prevProps.relatedNodes !== relatedNodes) {
      this.selectedNodes();
    }
    if (clearSelectedBool) {
      this.clearSelected();
    }
    if (
      (prevProps.width > 0 && prevProps.width !== width) ||
      (prevProps.height > 0 && prevProps.height !== height)
    ) {
      this.updateDimensions();
    }
  }

  handleChange(e) {
    const { reload } = this.props;
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;
    this.setState(
      {
        [name]: value,
      },
      () => {
        reload();
      }
    );
  }

  async drawGraph() {
    const { data, width, height } = this.props;
    const { edgesType, edgesLabels } = this.state;
    if (data === null) {
      return false;
    }

    const BATCH_SIZE = 100;
    const svg = d3
      .create('svg')
      .attr('id', 'visualisation-svg')
      .attr('viewBox', [0, 0, width, height]);

    const nodes = data.nodes.map((d) => Object.create(d));
    const links = data.links.map((d) => Object.create(d));

    const strength = -400;
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d) => d.id)
          .strength(1)
          .distance(60)
      )
      .force('charge', d3.forceManyBody().strength(strength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(20))
      .stop();

    // control ticks aka performance trick
    const iterations = 10;
    const threshold = 0.001;
    simulation.restart();
    for (let i = iterations; i > 0; i -= 1) {
      simulation.tick();
      if (simulation.alpha() < threshold) {
        break;
      }
    }
    simulation.stop();

    /* add zoom and pan btn actions */
    d3.select('#graph-zoom-in').on('click', () => {
      zoomHandler.scaleBy(svg, 1.25);
    });
    d3.select('#graph-zoom-out').on('click', () => {
      zoomHandler.scaleBy(svg, 0.75);
    });

    d3.select('#graph-pan-up').on('click', () => {
      const currentTransform = d3.zoomTransform(svg);
      const newX = currentTransform.x;
      const newY = currentTransform.y - 50;
      zoomHandler.translateBy(svg, newX, newY);
    });
    d3.select('#graph-pan-right').on('click', () => {
      const currentTransform = d3.zoomTransform(svg);
      const newX = currentTransform.x + 50;
      const newY = currentTransform.y;
      zoomHandler.translateBy(svg, newX, newY);
    });
    d3.select('#graph-pan-down').on('click', () => {
      const currentTransform = d3.zoomTransform(svg);
      const newX = currentTransform.x;
      const newY = currentTransform.y + 50;
      zoomHandler.translateBy(svg, newX, newY);
    });
    d3.select('#graph-pan-left').on('click', () => {
      const currentTransform = d3.zoomTransform(svg);
      const newX = currentTransform.x - 50;
      const newY = currentTransform.y;
      zoomHandler.translateBy(svg, newX, newY);
    });

    zoomHandler(svg);

    const g = svg
      .append('g')
      .attr('id', 'zoom-container')
      .attr('class', 'zoom-container');

    await drawLinks(
      g,
      links,
      BATCH_SIZE,
      edgesType,
      edgesLabels,
      width,
      height
    );
    await drawCircles(g, nodes, BATCH_SIZE, this.clickNode, width, height);

    document.getElementById('network-graph').innerHTML = '';
    document.getElementById('network-graph').append(svg.node());
    this.updateDimensions();
    return false;
  }

  updateDimensions() {
    const { width, height } = this.props;
    const container = document.getElementById('visualisation-svg');
    if (container !== null) {
      container.style.height = height;
      container.style.width = width;
      container.setAttribute('viewBox', [0, 0, width, height]);
    }
  }

  toggleOptions() {
    const { optionsVisible } = this.state;
    this.setState({
      optionsVisible: !optionsVisible,
    });
  }

  clickNode(d) {
    const { clickNode: clickNodeFn } = this.props;
    this.setState({ d });
    clickNodeFn(d.id);
  }

  selectedNodes() {
    const { d } = this.state;
    const { data, relatedLinks, relatedNodes } = this.props;
    const { links, nodes } = data;
    // 1. clear selected and associated nodes and links
    this.clearSelected();

    // 2. update newly selected node
    const node = document.getElementById(`node-${d.id}`);
    node.classList.add('selected');
    const circle = node.getElementsByTagName('circle')[0];

    const curColor = circle.getAttribute('stroke');
    const newR = circle.getAttribute('r');
    circle.setAttribute('prev-stroke', curColor);
    circle.setAttribute('r', parseFloat(newR, 10) + 5);
    circle.setAttribute('stroke-width', 3);
    circle.setAttribute('stroke', '#33729f');

    // 3. get associated links
    let incomingLinks = links.filter((l) => l.source === d.id);
    let outgoingLinks = links.filter((l) => l.target === d.id);
    incomingLinks = incomingLinks.map((l) => l.refId);
    outgoingLinks = outgoingLinks.map((l) => l.refId);

    const associatedLinks = incomingLinks.concat(
      outgoingLinks.filter((i) => incomingLinks.indexOf(i) === -1)
    );
    const mergedAssociatedLinks = associatedLinks.concat(
      relatedLinks.filter((i) => associatedLinks.indexOf(i) === -1)
    );
    // 3.3 associate new links
    const associatedNodeIds = [];
    mergedAssociatedLinks.forEach((l) => {
      const line = document.getElementById(`link-line-${l}`);
      if (line !== null) {
        line.setAttribute('stroke-width', 2);
        line.setAttribute('stroke', '#33729f');
        line.classList.add('associated');
      }
      if (l.source !== d.id) {
        if (associatedNodeIds.indexOf(l.source) === -1) {
          associatedNodeIds.push(l.source);
        }
        if (associatedNodeIds.indexOf(l.target) === -1) {
          associatedNodeIds.push(l.target);
        }
      }
    });
    const mergedNodesIds = [...associatedNodeIds, ...relatedNodes];
    // 4. get associated nodes
    const associatedNodes = nodes.filter(
      (n) => mergedNodesIds.indexOf(n.id) > -1
    );

    // 4.3 associate new nodes
    associatedNodes.forEach((n) => {
      const curNode = document.getElementById(`node-${n.id}`);
      const nCircle = curNode.getElementsByTagName('circle')[0];
      nCircle.setAttribute('stroke-width', 3);
      curNode.classList.add('associated');
    });
  }

  render() {
    const { edgesType, edgesLabels, optionsVisible } = this.state;
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
    if (edgesType === 'double') {
      edgesType0 = false;
      edgesType1 = true;
    }
    if (edgesLabels === 'visible') {
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

    const loadingBlock = (
      <div className="graph-loading">
        <i>Loading...</i> <Spinner color="info" />
      </div>
    );
    return (
      <div>
        <div>
          Nodes: <span id="nodes-count" /> | Links: <span id="links-count" />
        </div>
        <div id="network-graph">{loadingBlock}</div>
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
  reload: () => {},
  data: [],
  width: 0,
  height: 0,
  relatedNodes: [],
  relatedLinks: [],
  clearSelected: () => {},
  clickNode: () => {},
};

NetworkGraph.propTypes = {
  reload: PropTypes.func,
  data: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  relatedNodes: PropTypes.array,
  relatedLinks: PropTypes.array,
  clearSelected: PropTypes.func,
  clickNode: PropTypes.func,
};

export default NetworkGraph;
