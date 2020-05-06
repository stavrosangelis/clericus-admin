import React, {Component} from 'react';
import {Input, FormGroup} from 'reactstrap';
import * as d3 from "d3";

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
    this.chart = this.chart.bind(this);
    this.calcNodeSize = this.calcNodeSize.bind(this);
    this.drag = this.drag.bind(this);
    this.dragstarted = this.dragstarted.bind(this);
    this.dragged = this.dragged.bind(this);
    this.dragended = this.dragended.bind(this);
    this.zoomedStart = this.zoomedStart.bind(this);
    this.zoomed = this.zoomed.bind(this);
    this.zoomedEnd = this.zoomedEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.selectedNodes = this.selectedNodes.bind(this);
    this.clearSelected = this.clearSelected.bind(this);
  }

  drawGraph() {
    let context = this;
    setTimeout(function() {
      let data = context.props.data;
      let width = context.props.width;
      let height = context.props.height;

      if (data===null) {
        return false;
      }
      let chart = context.chart(data,width,height);
      document.getElementById("network-graph").innerHTML = "";
      document.getElementById("network-graph").append(chart);
    },0);
  }

  chart(data,width,height) {
    const context = this;
    var links = data.links.map(d => Object.create(d));
    const nodes = data.nodes.map(d => Object.create(d));

    if (this.state.edgesType==="simple") {
      let newLinks = [];
      let linksCheck = [];
      for (let i=0; i<links.length; i++) {
        let link = links[i];
        let source = String(link.source);
        let target = String(link.target);
        let check0 = source+", "+target;
        let check1 = target+", "+source;
        if (linksCheck.indexOf(check0)===-1 && linksCheck.indexOf(check1)===-1) {
          newLinks.push(link);
          linksCheck.push(check0);
        }
      }
      links = newLinks;
    }

    let sizes = nodes.map(n=>n.count);
    let maxSize = Math.max(...sizes);
    let sizeRatio = 3/maxSize;
    let strength = -400;
    if (this.state.edgesType==="double") {
      strength = -2000;
    }
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
    const iterations = 100;
    var threshold = 0.001;
    simulation.restart();
    for (var i = iterations; i > 0; --i) {
      simulation.tick();
      if(simulation.alpha() < threshold) {
        break;
      }
    }
    simulation.stop();

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g")
        .attr("class", "zoom-container");


    var link = null;
    if (this.state.edgesType==="simple") {
      link = g.selectAll(".network-line")
        .data(links)
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
        .attr("y2", d=>d.target.y);

      if (this.state.edgesLabels==="visible") {
        g.selectAll(".network-line-path")
          .data(links)
          .enter()
          .append('path')
          .attr('class', 'network-line-path')
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .attr('id',d=>"link-path-"+d.refId)
          .style("pointer-events", "none")
          .attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);

        g.selectAll(".network-text")
          .data(links)
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
    if (this.state.edgesType==="double") {
      link = g.selectAll("path")
        .data(links)
        .enter().append("g")
        .style("pointer-events", "none")
        .attr("id", d=>"link-"+d.refId)

      link.append("path")
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
        g.append("svg:defs").selectAll("marker")
          .data(["end"])
          .enter().append("svg:marker")
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

        if (this.state.edgesLabels==="visible") {
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

    const node = g.selectAll("circle")
      .data(nodes)
      .enter().append("g")
      //.call(this.drag(simulation))
      .attr("class", "network-node")
      .attr("id", d=>"node-"+d.id)
      .on("click", d=>{
        this.clickNode(d)
      })
      .attr("transform", d=> "translate(" + d.x  + "," + d.y + ")")

    node.append("circle")
      .attr("stroke", d=>d.strokeColor)
      .attr("stroke-width", 0.5)
      .attr("r", d=>context.calcNodeSize(d.count, sizeRatio))
      .attr("fill", d=>d.color)
      .attr("class", "network-circle");

    node.append("clipPath")
      .attr("id", d => "clip-path-"+d.id);

    node.append("text")
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

    const zoom_handler = d3.zoom()
      .scaleExtent([0.1, 8])
      .on("start", context.zoomedStart)
      .on("zoom", context.zoomed)
      .on("end", context.zoomedEnd);

    zoom_handler(svg);

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

    return svg.node();

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

  calcNodeSize(size, sizeRatio) {
    // min: 1.7 max: 5
    let newSize = parseFloat(sizeRatio,10)*parseInt(size,10);
    if (newSize<1.7) {
      newSize = 1.7;
    }
    return newSize*10;
  }

  drag(simulation) {
    return d3.drag()
        .on("start", (d)=> this.dragstarted(d,simulation))
        .on("drag", (d)=> this.dragged(d,simulation))
        .on("end", (d)=> this.dragended(d,simulation));
  }

  dragstarted(d,simulation) {
    if (!d3.event.active) simulation.alpha(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d,simulation) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d,simulation) {
    if (!d3.event.active) simulation.alpha(0);
    d.fx = null;
    d.fy = null;
  }

  zoomedStart() {
    // 1. hide edges and edge labels
    d3.selectAll(".network-line").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });
    d3.selectAll(".network-line-path").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });
    d3.selectAll(".network-text").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });
  }

  zoomed() {
    let g = document.getElementsByClassName("zoom-container")[0];
    // 1. hide edges and edge labels
    d3.selectAll(".network-line").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });
    d3.selectAll(".network-line-path").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });
    d3.selectAll(".network-text").each(function() {
      d3.select(this).attr("visibility", "hidden");
    });

    // 2. apply transformation
    g.setAttribute("transform", d3.event.transform.toString());

    // 3. show edges and edge labels
    setTimeout(function() {
      d3.selectAll(".network-line").each(function() {
        d3.select(this).attr("visibility", "visible");
      });
      d3.selectAll(".network-line-path").each(function() {
        d3.select(this).attr("visibility", "visible");
      });
      d3.selectAll(".network-text").each(function() {
        d3.select(this).attr("visibility", "visible");
      });
    },500);

  }

  zoomedEnd() {
    d3.selectAll(".network-line").each(function() {
      d3.select(this).attr("visibility", "visible");
    });
    d3.selectAll(".network-line-path").each(function() {
      d3.select(this).attr("visibility", "visible");
    });
    d3.selectAll(".network-text").each(function() {
      d3.select(this).attr("visibility", "visible");
    });
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
                <Input type="radio" name="edgesType" value="double" onChange={this.handleChange} checked={edgesType1}/> Two-directional edges
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
                <Input type="radio" name="edgesLabels" value="visible" onChange={this.handleChange} checked={edgesLabels1}/> Visible
              </label>
            </FormGroup>
            <div className="info">*May affect performance</div>
          </div>
        </div>
      </div>
    </div>
    return (
      <div>
        <div id="network-graph"></div>
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
