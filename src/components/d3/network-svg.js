import React, {Component} from 'react';
import {Input, FormGroup} from 'reactstrap';
import * as d3 from "d3";
import {Spinner} from 'reactstrap';

// d3 functions
const calcNodeSize = (size, sizeRatio) => {
  // min: 1.7 max: 5
  let newSize = parseFloat(sizeRatio,10)*parseInt(size,10);
  if (newSize<1.7) {
    newSize = 1.7;
  }
  return newSize*10;
}

const toggleVisibleNodes = (coords, width, height) => {
  if (typeof width==="string") {
    width = width.replace("px", "");
    width = parseInt(width,10)
  }
  if (typeof height==="string") {
    height = height.replace("px", "");
    height = parseInt(height,10)
  }
  let lx = coords.x;
  let ty = coords.y;
  let scale = coords.k;

  d3.selectAll("g.network-node").attr("visibility", d=>{
    let visibility = "hidden";
    let newX = lx+(d.x*scale);
    let newY = ty+(d.y*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      visibility = "visible";
    }
    return visibility;
  });
  d3.selectAll("line.network-line").attr("visibility", d=>{
    let visibility = "hidden";
    let newX = lx+(d.source.x*scale);
    let newY = ty+(d.source.y*scale);
    if (newX>0 && newX<width && newY>0 && newY<height) {
      visibility = "visible";
    }
    return visibility;
  });
}

const zoomedStart = () => {
  // 1. hide edges and edge labels
  d3.selectAll(".network-line").attr("visibility", "hidden");
  d3.selectAll(".network-line-path").attr("visibility", "hidden");
  d3.selectAll(".network-text").attr("visibility", "hidden");
}

const zoomed = () => {
  let g = document.getElementsByClassName("zoom-container")[0];
  // 1. hide edges and edge labels
  d3.selectAll(".network-line").attr("visibility", "hidden");
  d3.selectAll(".network-line-path").attr("visibility", "hidden");
  d3.selectAll(".network-text").attr("visibility", "hidden");

  // 2. apply transformation
  g.setAttribute("transform", d3.event.transform.toString());
}

const zoomedEnd = async() => {
  let coords = d3.event.transform;
  let svg = d3.select("#visualisation-svg");
  let width = svg.style("width");
  let height = svg.style("height");
  //d3.selectAll(".network-line-path").attr("visibility", "visible");
  //d3.selectAll(".network-text").attr("visibility", "visible");
  toggleVisibleNodes(coords, width, height);
}

const zoom_handler = d3.zoom()
  .scaleExtent([0.1, 8])
  .on("start", zoomedStart)
  .on("zoom", zoomed)
  .on("end", zoomedEnd);

const drawCircles = (g, nodes, batchSize, clickNode, width, height) => {
  let coords = d3.zoomTransform(g);
  let lx = coords.x;
  let ty = coords.y;
  document.getElementById("nodes-count").innerHTML = nodes.length;
  return new Promise((resolve, reject) => {
    let sizes = nodes.map(n=>n.count);
    let maxSize = Math.max(...sizes);
    let sizeRatio = 3/maxSize;
    let node = g.selectAll("g.network-node");

    const drawBatch = (batchNumber) => {
     return function() {
        var startIndex = batchNumber * batchSize;
        var stopIndex = Math.min(nodes.length, startIndex + batchSize);
        let nodeData = nodes.slice(startIndex, stopIndex);

        let wrapper = node
          .data(nodeData)
          .enter()
          .append("g")
          .attr("class", "network-node")
          .attr("id", d=>"node-"+d.id)
          .on("click", d=>{
            clickNode(d)
          })
          .attr("transform", d=>"translate(" + d.x  + "," + d.y + ")")
          .attr("visibility", d=>{
            let visibility = "hidden";
            let newX = lx+d.x;
            let newY = ty+d.y;
            if (newX>0 && newX<width && newY>0 && newY<height) {
              visibility = "visible";
            }
            return visibility;
          });

          wrapper.append("circle")
          .attr("stroke", d=>d.strokeColor)
          .attr("stroke-width", 0.5)
          .attr("r", d=>calcNodeSize(d.count, sizeRatio))
          .attr("fill", d=>d.color)
          .attr("class", "network-circle")

          wrapper.append("clipPath")
          .attr("id", d => "clip-path-"+d.id)

          wrapper.append("text")
          .attr("clip-path", d => "clip-path-"+d.id)
          .selectAll("tspan")
          .data(d => d.label.split(" "))
          .join("tspan")
          .attr("text-anchor", "middle")
          .attr("font-size", "4.5pt")
          .attr("font-family", "sans-serif")
          .attr("fill", "#fff")
          .attr("x", 0)
          .attr("y", (d, i, nodes) => {
            let y = i - nodes.length/2 + 0.6+"em";
            return  y
          })
          .text(d => d);

        if (stopIndex >= nodes.length) {
          resolve(true);
        } else {
          setTimeout(drawBatch(batchNumber + 1), 0);
        }
      };
    }
    setTimeout(drawBatch(0), 0);
  });
}

const drawLinks = (g, links, batchSize, edgesType, edgesLabels, width, height) => {
  let coords = d3.zoomTransform(g);
  let lx = coords.x;
  let ty = coords.y;
  return new Promise((resolve, reject) => {
    let link = g.selectAll("line.network-line");
    if (edgesType==="simple") {
      let compare = [];
      let newLinks = [];
      for (let i=0; i<links.length; i++) {
        let item = links[i];
        let nodes = `${item.source.index},${item.target.index}`;
        if(compare.indexOf(nodes)===-1) {
          compare.push(nodes);
          newLinks.push(item);
        }
      }
      links = newLinks;
    }
    document.getElementById("links-count").innerHTML = links.length;
    if (edgesType==="double") {
       link = g.selectAll("path")
    }
    let linkLabel = g.selectAll(".network-line-path");
    let linkText = g.selectAll(".network-text");
    let marker = g.append("svg:defs").selectAll("marker");
    const drawBatch = (batchNumber) => {
      return function() {
        var startIndex = batchNumber * batchSize;
        var stopIndex = Math.min(links.length, startIndex + batchSize);
        let linksData = links.slice(startIndex, stopIndex);
        if (edgesType==="simple") {
          link
            .data(linksData)
            .enter()
            .append("line")
            .attr('class', 'network-line')
            .style("pointer-events", "none")
            .attr("id", d=>"link-line-"+d.refId)
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.9)
            .attr("x1", d=>d.source.x)
            .attr("y1", d=>d.source.y)
            .attr("x2", d=>d.target.x)
            .attr("y2", d=>d.target.y)
            .attr("visibility", d=>{
              let visibility = "hidden";
              let newX = lx+d.source.x;
              let newY = ty+d.source.y;
              if (newX>0 && newX<width && newY>0 && newY<height) {
                visibility = "visible";
              }
              return visibility;
            });;

          if (edgesLabels==="visible") {
            linkLabel
              .data(linksData)
              .enter()
              .append('path')
              .attr('class', 'network-line-path')
              .attr('fill-opacity', 0)
              .attr('stroke-opacity', 0)
              .attr('id',d=>"link-path-"+d.refId)
              .style("pointer-events", "none")
              .attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);

            linkText
              .data(linksData)
              .enter()
              .append("text")
              .attr("id", d=>"link-text-"+d.refId)
              .attr("class", "network-text")
              .style("pointer-events", "none")
              .append("textPath")
              .style("text-anchor","middle")
              .style("pointer-events", "none")
              .attr("font-size", "5pt")
              .attr("xlink:href", d=>"#link-path-"+d.refId)
              .attr("startOffset", "50%")
              .attr("font-family", "sans-serif")
              .attr("fill", "#666")
              .text(d=> d.label);
          }
        }
        if (edgesType==="double") {
          link
            .data(linksData)
            .enter().append("g")
            .style("pointer-events", "none")
            .attr("id", d=>"link-"+d.refId)
            .append("path")
            .attr("class", "network-line")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.9)
            .attr("marker-end", "url(#end)")
            .attr("id", d=>"link-line-"+d.refId)
            .style("pointer-events", "none")
            .attr("d", (d)=> {
              let dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
              return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            });

            // markers
            marker
              .data(["end"])
              .enter()
              .append("svg:marker")
              .attr("id", String)
              .attr("viewBox", "0 -5 10 10")
              .attr("refX", 58)
              .attr("refY",-4.5)
              .attr("markerWidth", 4)
              .attr("markerHeight", 4)
              .attr("orient", "auto")
              .attr("fill", "#999")
              .style("pointer-events", "none")
              .append("svg:path")
              .attr("d", "M0,-5L10,0L0,5");

            if (edgesLabels==="visible") {
              link
                .append("text")
                .append("textPath")
                .style("text-anchor","middle")
                .style("pointer-events", "none")
                .attr("font-size", "4.5pt")
                .attr("class", "network-text")
                .attr("id", d=>"link-text-"+d.refId)
                .attr("xlink:href", d=>"#link-line-"+d.refId)
                .attr("startOffset", "50%")
                .attr("font-family", "sans-serif")
                .attr("fill", "#666")
                .text(d=> d.label);
            }
        }

        if (stopIndex >= links.length) {
          resolve(true);
        } else {
          setTimeout(drawBatch(batchNumber + 1), 0);
        }
      };
    }
    setTimeout(drawBatch(0), 0);
  });
}

class NetworkGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chart: [],
      optionsVisible: false,
      edgesType: "simple",
      edgesLabels: "hidden",
      d: null
    }

    this.drawGraph = this.drawGraph.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.selectedNodes = this.selectedNodes.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
  }

  async drawGraph() {
    let data = this.props.data;
    let width = this.props.width;
    let height = this.props.height;
    if (data===null) {
      return false;
    }

    let BATCH_SIZE = 100;
    const svg = d3.create("svg")
      .attr("id", "visualisation-svg")
      .attr("viewBox", [0, 0, width, height]);

    let nodes = data.nodes.map(d => Object.create(d));
    let links = data.links.map(d => Object.create(d));;

    let strength = -400;
    const simulation = d3.forceSimulation(nodes)
      .force("link",
      d3.forceLink(links)
          .id(d => d.id)
          .strength(1)
          .distance(60)
        )
      .force("charge", d3.forceManyBody().strength(strength))
      .force("center", d3.forceCenter(width/2, height/2))
      .force('collide', d3.forceCollide(20))
      .stop();

    // control ticks aka performance trick
    const iterations = 10;
    var threshold = 0.001;
    simulation.restart();
    for (var i = iterations; i > 0; --i) {
      simulation.tick();
      if(simulation.alpha() < threshold) {
        break;
      }
    }
    simulation.stop();



    /* add zoom and pan btn actions */
    d3.select("#graph-zoom-in")
    .on("click", function() {
      zoom_handler.scaleBy(svg, 1.25);
    });
    d3.select("#graph-zoom-out")
    .on("click", function() {
      zoom_handler.scaleBy(svg, 0.75);
    });

    d3.select("#graph-pan-up")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(svg);
      let newX = currentTransform.x;
      let newY = currentTransform.y - 50;
      zoom_handler.translateBy(svg, newX, newY);
    });
    d3.select("#graph-pan-right")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(svg);
      let newX = currentTransform.x + 50;
      let newY = currentTransform.y;
      zoom_handler.translateBy(svg, newX, newY);
    });
    d3.select("#graph-pan-down")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(svg);
      let newX = currentTransform.x;
      let newY = currentTransform.y + 50;
      zoom_handler.translateBy(svg, newX, newY);
    });
    d3.select("#graph-pan-left")
    .on("click", function() {
      let currentTransform = d3.zoomTransform(svg);
      let newX = currentTransform.x - 50;
      let newY = currentTransform.y;
      zoom_handler.translateBy(svg, newX, newY);
    });

    zoom_handler(svg);

    const g = svg.append("g")
          .attr("id", "zoom-container")
          .attr("class", "zoom-container");

    await drawLinks(g, links, BATCH_SIZE, this.state.edgesType, this.state.edgesLabels, width, height);
    await drawCircles(g, nodes, BATCH_SIZE, this.clickNode, width, height);

    document.getElementById("network-graph").innerHTML = "";
    document.getElementById("network-graph").append(svg.node());
    this.updateDimensions();
  }

  updateDimensions() {
    let width = this.props.width;
    let height = this.props.height;
    let container = document.getElementById("visualisation-svg");
    if (container!==null) {
      container.style.height = height;
      container.style.width = width;
      container.setAttribute("viewBox", [0, 0, width, height]);
    }
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    let name = target.name;
    this.setState({
      [name]: value
    }, ()=>{
      this.props.reload();
    })
  }

  toggleOptions() {
    this.setState({
      optionsVisible: !this.state.optionsVisible
    })
  }

  clickNode(d) {
    this.setState({d:d});
    this.props.clickNode(d.id);
  }

  selectedNodes() {
    let d = this.state.d;
    // 1. clear selected and associated nodes and links
    this.clearSelected();

    // 2. update newly selected node
    let node = document.getElementById("node-"+d.id);
    node.classList.add("selected");
    let circle = node.getElementsByTagName("circle")[0];

    let curColor = circle.getAttribute("stroke");
    let newR = circle.getAttribute("r");
    circle.setAttribute("prev-stroke", curColor);
    circle.setAttribute("r",parseFloat(newR,10)+5);
    circle.setAttribute("stroke-width", 3);
    circle.setAttribute("stroke", "#33729f");

    // 3. get associated links
    var links = this.props.data.links;
    let incomingLinks = links.filter(l=>l.source===d.id);
    let outgoingLinks = links.filter(l=>l.target===d.id);
    incomingLinks = incomingLinks.map(l=>l.refId);
    outgoingLinks = outgoingLinks.map(l=>l.refId);

    let associatedLinks = incomingLinks.concat(outgoingLinks.filter(i => incomingLinks.indexOf(i)===-1));
    let mergedAssociatedLinks = associatedLinks.concat(this.props.relatedLinks.filter(i => associatedLinks.indexOf(i)===-1));
    // 3.3 associate new links
    let associatedNodeIds = [];
    mergedAssociatedLinks.forEach(l=>{
      let line = document.getElementById("link-line-"+l);
      if (line!==null) {
        line.setAttribute("stroke-width", 2);
        line.setAttribute("stroke", "#33729f");
        line.classList.add("associated");
      }
      if (l.source!==d.id) {
        if (associatedNodeIds.indexOf(l.source)===-1) {
          associatedNodeIds.push(l.source)
        }
        if (associatedNodeIds.indexOf(l.target)===-1) {
          associatedNodeIds.push(l.target)
        }
      }
    });
    let mergedNodesIds = [...associatedNodeIds,...this.props.relatedNodes];
    // 4. get associated nodes
    const nodes = this.props.data.nodes;
    let associatedNodes = nodes.filter(n=>mergedNodesIds.indexOf(n.id)>-1);

    // 4.3 associate new nodes
    associatedNodes.forEach(n=>{
      let node = document.getElementById("node-"+n.id);
      let circle = node.getElementsByTagName("circle")[0];
      circle.setAttribute("stroke-width", 3);
      node.classList.add("associated");
    });
  }

  clearSelected() {
    // 1. revert selected node
    let prev = document.getElementsByClassName("network-node selected")[0];
    if (typeof prev!=="undefined") {
      let prevCircle = prev.getElementsByTagName("circle")[0];
      let prevColor = prevCircle.getAttribute("prev-stroke");
      let r = prevCircle.getAttribute("r");
      prevCircle.setAttribute("stroke-width", 0.5)
      prevCircle.setAttribute("stroke",prevColor);
      prevCircle.setAttribute("r",parseFloat(r,10)-5);
      prev.classList.remove("selected");
    }

    // 2. revert associated links
    let selectedLinks = document.getElementsByClassName("network-line associated");
    if (typeof selectedLinks!=="undefined" && selectedLinks.length>0) {
      [...selectedLinks].forEach(line=> {
        if (typeof line!=="undefined") {
          line.setAttribute("stroke-width", 1);
          line.setAttribute("stroke", "#999");
          line.classList.remove("associated");
        }
      })
    }

    // 3. revert associated nodes
    let selectedNodes = document.getElementsByClassName("network-node associated");
    if (typeof selectedNodes!=="undefined" && selectedNodes.length>0) {
      [...selectedNodes].forEach(node=> {
        let circle = node.getElementsByTagName("circle")[0];
        if (typeof circle!=="undefined") {
          circle.setAttribute("stroke-width", 1);
        }
        node.classList.remove("associated");
      })
    }

  }

  componentDidMount() {
    if (this.props.data!==null) {
      this.drawGraph();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.data!==null && prevProps.data!==this.props.data) {
      this.drawGraph();
    }

    if (this.props.relatedNodes.length>0 && prevProps.relatedNodes!==this.props.relatedNodes) {
      this.selectedNodes();
    }
    if (this.props.clearSelected) {
      this.clearSelected();
    }
    if (
      (prevProps.width>0 && prevProps.width!==this.props.width)
      || (prevProps.height>0 && prevProps.height!==this.props.height)) {
      this.updateDimensions();
    }
  }


  render() {
    let zoomPanel = <div className="zoom-panel">
          <div
            id="graph-zoom-in"
            className="zoom-action">
            <i className="fa fa-plus" />
          </div>
          <div
            id="graph-zoom-out"
            className="zoom-action">
            <i className="fa fa-minus" />
          </div>
      </div>

    let panPanel = <div className="pan-container">
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

    let edgesType0=true, edgesType1=false,edgesLabels0=true, edgesLabels1=false;
    if (this.state.edgesType==="double") {
      edgesType0=false;
      edgesType1=true;
    }
    if (this.state.edgesLabels==="visible") {
      edgesLabels0=false;
      edgesLabels1=true;
    }

    let optionsVisibleClass = "";
    if (this.state.optionsVisible) {
      optionsVisibleClass = " visible";
    }

    let optionsPanel = <div className="options-container">
      <div className="options-trigger" onClick={()=>this.toggleOptions()}>
        <i className="fa fa-cog" />
      </div>
      <div className={"options-panel"+optionsVisibleClass}>
        <div className="options-panel-body">
          <div className="option">
            <label>Edges type</label>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesType" value="simple" onChange={this.handleChange} checked={edgesType0}/> Simple edges
              </label>
            </FormGroup>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesType" value="double" onChange={this.handleChange} checked={edgesType1}/> Two-directional edges*
              </label>
            </FormGroup>
          </div>
          <div className="option">
            <label>Edges labels</label>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesLabels" value="hidden" onChange={this.handleChange} checked={edgesLabels0}/> Hidden
              </label>
            </FormGroup>
            <FormGroup>
              <label>
                <Input type="radio" name="edgesLabels" value="visible" onChange={this.handleChange} checked={edgesLabels1}/> Visible*
              </label>
            </FormGroup>
            <div className="info">*May affect performance</div>
          </div>
        </div>
      </div>
    </div>

    let loadingBlock = <div className="graph-loading"><i>Loading...</i> <Spinner color="info" /></div>
    return (
      <div>
        <div>
          Nodes: <span id="nodes-count"></span> | Links: <span id="links-count"></span>
        </div>
        <div id="network-graph">{loadingBlock}</div>
        <div className="graph-actions">
          {panPanel}
          {zoomPanel}
          {optionsPanel}
        </div>
      </div>
    )
  }
}

export default NetworkGraph;
