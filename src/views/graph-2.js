import React, {Component} from 'react';
import { Link } from "react-router-dom";
import { Badge } from 'reactstrap';
import axios from 'axios';
import NetworkGraph from '../components/d3/copy-network';

const APIPath = process.env.REACT_APP_APIPATH;

class GraphView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      loading: true,
      width: 600,
      height: 500,
      eventsLoad: true,
      organisationsLoad: true,
      peopleLoad: true,
      resourcesLoad: true,
      reloadGraph: false,
      detailsCardVisible: false,
      detailsCardTitle: [],
      detailsCardEntityInfo: [],
      detailsCardContent: [],
      collapsible: false,
      steps: 1,
      relatedNodes: [],
      relatedLinks: [],
      clearSelectedNodes: false,
    }

    this.load = this.load.bind(this);
    this.updateCanvasSize = this.updateCanvasSize.bind(this);
    this.toggleGraphData = this.toggleGraphData.bind(this);
    this.toggleDetailsCard = this.toggleDetailsCard.bind(this);
    this.clearDetailsCard = this.clearDetailsCard.bind(this);
    this.clickNode = this.clickNode.bind(this);
    this.expandMiddle = this.expandMiddle.bind(this);
    this.clickLink = this.clickLink.bind(this);
    this.updateGraphOptions = this.updateGraphOptions.bind(this);
    this.setSteps = this.setSteps.bind(this);
  }

  async load() {
    let params = {
      events: this.state.eventsLoad,
      organisations: this.state.organisationsLoad,
      people: this.state.peopleLoad,
      resources: this.state.resourcesLoad,
    }
    let responseData = await axios({
      method: 'get',
      url: APIPath+'graph',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    this.setState({
      loading: false,
      data: responseData
    },()=> {
      this.updateCanvasSize();
    });
  }

  updateCanvasSize() {
    if (this.state.data!==null) {
      let container = document.getElementById('graph-container');
      let width = container.offsetWidth-2;
      let windowHeight = window.innerHeight - 100;
      if (windowHeight>630) {
        container.style.height = (windowHeight-133)+"px";
      }
      else {
        container.style.height = "400px";
      }
      let height = container.offsetHeight-2;
      this.setState({
        width: width,
        height: height,
      })
    }

  }

  toggleGraphData(type) {
    this.setState({
      [type]:!this.state[type],
      reloadGraph: true,
      data: null,
      loading: true,
    })
  }

  updateGraphOptions() {
    this.setState({
      reloadGraph: true,
      data: null,
      loading: true,
    })
  }

  setSteps(val=1, _id) {
    this.setState({
      steps: val
    },()=>{
      this.clickNode(_id);
    })
  }

  async clickNode(nodeId) {
    let params = {
      _id: nodeId,
      steps: this.state.steps
    }
    let data = await axios({
      method: 'get',
      url: APIPath+'related-nodes',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });
    let findNode = this.state.data.nodes.find(node=>node.id===nodeId);
    let node = findNode;
    let nodeType = node.type;
    let nodeLink = <Link href={"/"+nodeType+"/"+nodeId} to={"/"+nodeType+"/"+nodeId}><b>{node.label}</b> [{nodeType}]</Link>;

    // 1. prepare paths to output
    let relatedNodesIds = [];
    relatedNodesIds.push(nodeId);
    let nodesHTML = data.map((node,i)=>{
      if (relatedNodesIds.indexOf(node._id)===-1) {
          relatedNodesIds.push(node._id);
        }
      let nodeType = node.systemLabels[0];
      let nodeLink = <Link href={"/"+nodeType+"/"+node._id} to={"/"+nodeType+"/"+node._id}><b>{node.label}</b> [{nodeType}]</Link>;
      return <li key={i}>{nodeLink}</li>;
    });

    let relatedLinksIds = this.state.data.links.filter(link=>{
      if (relatedNodesIds.indexOf(link.source)>-1 && relatedNodesIds.indexOf(link.target)>-1) {
        return true;
      }
      return false;
    }).map(link=>link.refId);

    let detailsCardTitle = <h4>Entity details</h4>
    let step1Color = "light";
    let step2Color = "light";
    let step3Color = "light";
    let step4Color = "light";
    let step5Color = "light";
    let step6Color = "light";
    if (this.state.steps===1) {
      step1Color = "secondary";
    }
    if (this.state.steps===2) {
      step2Color = "secondary";
    }
    if (this.state.steps===3) {
      step3Color = "secondary";
    }
    if (this.state.steps===4) {
      step4Color = "secondary";
    }
    if (this.state.steps===5) {
      step5Color = "secondary";
    }
    if (this.state.steps===6) {
      step6Color = "secondary";
    }
    let detailsCardEntityInfo = <div>
      <div>
        <label>Entity: </label> {nodeLink}
      </div>
      <div className="node-relations-title">
        <div>
          <label>Steps:</label>{' '}
          <Badge color={step1Color} pill size="sm" onClick={()=>this.setSteps(1,nodeId)}>1</Badge>{' '}
          <Badge color={step2Color} pill size="sm" onClick={()=>this.setSteps(2,nodeId)}>2</Badge>{' '}
          <Badge color={step3Color} pill size="sm" onClick={()=>this.setSteps(3,nodeId)}>3</Badge>{' '}
          <Badge color={step4Color} pill size="sm" onClick={()=>this.setSteps(4,nodeId)}>4</Badge>{' '}
          <Badge color={step5Color} pill size="sm" onClick={()=>this.setSteps(5,nodeId)}>5</Badge>{' '}
          <Badge color={step6Color} pill size="sm" onClick={()=>this.setSteps(6,nodeId)}>6</Badge>
        </div>
        <label>Related nodes [<b>{nodesHTML.length}</b>]</label>
      </div>
    </div>
    let detailsCardContent = <ul className="entries-list">{nodesHTML}</ul>

    this.setState({
      detailsCardTitle: detailsCardTitle,
      detailsCardEntityInfo: detailsCardEntityInfo,
      detailsCardContent: detailsCardContent,
      relatedNodes: relatedNodesIds,
      relatedLinks: relatedLinksIds,
    });
    this.toggleDetailsCard(true);
  };

  async availablePaths(nodeId) {
    let params = {
      _id: nodeId,
      steps: this.state.steps
    }
    let data = await axios({
      method: 'get',
      url: APIPath+'references',
      crossDomain: true,
      params: params
    })
	  .then(function (response) {
      return response.data.data;
	  })
	  .catch(function (error) {
      console.log(error);
	  });

    let findNode = data.find(s=>{
      if (s[0].start._id===nodeId) {
        return true;
      }
      return false;
    });
    let node = findNode[0].start;
    let nodeType = node.entityType[0];
    let nodeLink = <Link href={"/"+nodeType+"/"+nodeId} to={"/"+nodeType+"/"+nodeId}><b>{node.label}</b> [{nodeType}]</Link>;

    // 1. prepare paths to output
    let relatedNodesIds = [];
    let relatedLinksIds = [];
    let pathsHTML = data.map((s,i)=>{
      let start = null;
      let middle = [];
      let end = null;

      for (let j=0;j<s.length; j++) {
        let p = s[j];
        let lastIndex = s.length - 1;
        let item = <span key={j}>
          <Link href={"/"+p.start.entityType[0]+"/"+p.start._id} to={"/"+p.start.entityType[0]+"/"+p.start._id}><b>{p.start.label}</b> <small>[{p.start.entityType[0]}]</small></Link>
          {' '}<span className="graph-link-rel"><i>{p.rel.type}</i></span>{' '}
          <Link href={"/"+p.end.entityType[0]+"/"+p.end._id} to={"/"+p.end.entityType[0]+"/"+p.end._id}><b>{p.end.label}</b> <small>[{p.end.entityType[0]}]</small></Link>
        </span>;

        if (j===0 && lastIndex===0) {
          start = item;
        }
        if (j===0 && lastIndex>0) {
          start = <span key={j}>
            <Link href={"/"+p.start.entityType[0]+"/"+p.start._id} to={"/"+p.start.entityType[0]+"/"+p.start._id}><b>{p.start.label}</b> <small>[{p.start.entityType[0]}]</small></Link> =>
          </span>;
          middle.push(<li key={j}>{item}</li>)
        }

        if (j>0 && j<lastIndex) {
          middle.push(<li key={j}>{item}</li>)
        }
        if (j>0 && j===lastIndex) {
          middle.push(<li key={j}>{item}</li>)
          end = <span key={j}>=>{' '}
            <Link href={"/"+p.end.entityType[0]+"/"+p.end._id} to={"/"+p.end.entityType[0]+"/"+p.end._id}><b>{p.end.label}</b> <small>[{p.end.entityType[0]}]</small></Link>
          </span>;
        }

        if (relatedNodesIds.indexOf(p.start._id)===-1) {
          relatedNodesIds.push(p.start._id);
        }
        if (relatedNodesIds.indexOf(p.end._id)===-1) {
          relatedNodesIds.push(p.end._id);
        }
        // push relation id
        if (relatedLinksIds.indexOf(p.rel._id)===-1) {
          relatedLinksIds.push(p.rel._id);
        }
      }
      let pathHTML = [];
      if (start!==null) {
        pathHTML.push(start);
      }
      if (middle.length>0) {
        pathHTML.push([<span key='expand-middle-start' className='expand-middle' onClick={()=>{this.expandMiddle('middle-'+i)}} id={'middle-'+i+'-start'}> [<span className="expand-middle-text">...]</span></span>, <ul className='expand-middle-list' key='middle' id={'middle-'+i}>{middle}</ul>,<span key='expand-middle-end' className='expand-middle-end' id={'middle-'+i+'-end'} onClick={()=>{this.expandMiddle('middle-'+i)}} >] </span>])
      }
      if (end!==null) {
        pathHTML.push(end);
      }
      return <li key={i}>{pathHTML}</li>;
    });

    let detailsCardTitle = <h4>Entity details</h4>
    let step1Color = "light";
    let step2Color = "light";
    let step3Color = "light";
    let step4Color = "light";
    let step5Color = "light";
    let step6Color = "light";
    if (this.state.steps===1) {
      step1Color = "secondary";
    }
    if (this.state.steps===2) {
      step2Color = "secondary";
    }
    if (this.state.steps===3) {
      step3Color = "secondary";
    }
    if (this.state.steps===4) {
      step4Color = "secondary";
    }
    if (this.state.steps===5) {
      step5Color = "secondary";
    }
    if (this.state.steps===6) {
      step6Color = "secondary";
    }
    let detailsCardEntityInfo = <div>
      <div>
        <label>Entity: </label> {nodeLink}
      </div>
      <div className="node-relations-title">
        <div>
          <label>Steps:</label>{' '}
          <Badge color={step1Color} pill size="sm" onClick={()=>this.setSteps(1,nodeId)}>1</Badge>{' '}
          <Badge color={step2Color} pill size="sm" onClick={()=>this.setSteps(2,nodeId)}>2</Badge>{' '}
          <Badge color={step3Color} pill size="sm" onClick={()=>this.setSteps(3,nodeId)}>3</Badge>{' '}
          <Badge color={step4Color} pill size="sm" onClick={()=>this.setSteps(4,nodeId)}>4</Badge>{' '}
          <Badge color={step5Color} pill size="sm" onClick={()=>this.setSteps(5,nodeId)}>5</Badge>{' '}
          <Badge color={step6Color} pill size="sm" onClick={()=>this.setSteps(6,nodeId)}>6</Badge>
        </div>
        <label>Available paths [<b>{pathsHTML.length}</b>]</label>
      </div>
    </div>
    let detailsCardContent = <ul className="entries-list">{pathsHTML}</ul>

    this.setState({
      detailsCardTitle: detailsCardTitle,
      detailsCardEntityInfo: detailsCardEntityInfo,
      detailsCardContent: detailsCardContent,
      relatedNodes: relatedNodesIds,
      relatedLinks: relatedLinksIds,
    });
    this.toggleDetailsCard(true);
  };

  expandMiddle(id) {
    let start = document.getElementById(id+'-start');
    let list = document.getElementById(id);
    let end = document.getElementById(id+'-end');

    let expanded = start.classList.contains("expanded");
    if (!expanded) {
      start.classList.add("expanded");
      list.classList.add("visible");
      end.classList.add("visible");
    }
    else {
      start.classList.remove("expanded");
      list.classList.remove("visible");
      end.classList.remove("visible");
    }
  }

  clickLink(source, target) {
    let nodes = this.state.data.nodes;
    let srcNode = nodes.find(item=>item.id===source);
    let targetNode = nodes.find(item=>item.id===target);
    let srcId = source.replace(srcNode.type+"_", "");
    let targetId = target.replace(targetNode.type+"_", "");
    let detailsCardTitle = <h4>Entities relation</h4>

    let links = this.state.data.links;
    let link = links.find(item => {
      if (item.source===source && item.target===target) {
        return item;
      }
      else {return false}
    });
    let srcContent = <div>
      <Link href={"/"+srcNode.type+"/"+srcId} to={"/"+srcNode.type+"/"+srcId}>
      <b>{srcNode.label}</b> [{srcNode.type}]</Link>
    </div>

    let targetContent = <div>
      <Link href={"/"+targetNode.type+"/"+targetId} to={"/"+targetNode.type+"/"+targetId}>
        <b>{targetNode.label}</b> [{targetNode.type}]</Link>
    </div>

    let linkContent = <div><i>{link.label}</i></div>

    let detailsCardContent = <div className="flexbox">
      {srcContent}
      {linkContent}
      {targetContent}
    </div>
    this.setState({
      detailsCardTitle: detailsCardTitle,
      detailsCardContent: detailsCardContent,
    });
    this.toggleDetailsCard(true);
  };

  toggleDetailsCard(value=null) {
    if (value===null) {
      value = !this.state.detailsCardVisible;
    }
    this.setState({
      detailsCardVisible: value,
      steps: 1
    })
  }

  clearDetailsCard() {
    this.setState({
      detailsCardVisible: false,
      relatedNodes: [],
      relatedLinks: [],
      clearSelectedNodes: true,
      steps: 1
    })
  }

  componentDidMount() {
    this.load();
    window.addEventListener('resize', this.updateCanvasSize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.reloadGraph) {
      this.load();
      this.setState({
        reloadGraph: false
      })
    }
    if (this.state.clearSelectedNodes) {
      this.setState({
        clearSelectedNodes: false
      })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateCanvasSize);
  }

  render() {
    let eventsClass = "",organisationsClass="",peopleClass="",resourcesClass="";
    if (this.state.eventsLoad) {
      eventsClass = " active";
    }
    if (this.state.organisationsLoad) {
      organisationsClass = " active";
    }
    if (this.state.peopleLoad) {
      peopleClass = " active";
    }
    if (this.state.resourcesLoad) {
      resourcesClass = " active";
    }
    let legend = <div className="graph-legend">
      <div className={eventsClass} onClick={()=> this.toggleGraphData("eventsLoad")}>
        <div className="icon circle"></div> Event</div>
      <div className={organisationsClass} onClick={()=> this.toggleGraphData("organisationsLoad")}>
        <div className="icon diamond"></div> Organisation</div>
      <div className={peopleClass} onClick={()=> this.toggleGraphData("peopleLoad")}>
        <div className="icon wye"></div> Person</div>
      <div className={resourcesClass} onClick={()=> this.toggleGraphData("resourcesLoad")}>
        <div className="icon square"></div> Resource</div>
    </div>
    let detailsCardVisibleClass = " hidden";
    if (this.state.detailsCardVisible) {
      detailsCardVisibleClass = "";
    }

    let detailsCard =  <div className={"card graph-details-card"+detailsCardVisibleClass}>
      <div className="graph-details-card-close" onClick={()=>this.toggleDetailsCard()}>
        <i className="fa fa-times" />
      </div>
      <div className="card-title">{this.state.detailsCardTitle}</div>
      <div className="card-body">
        <div className="entity-info">
          {this.state.detailsCardEntityInfo}
        </div>
        <div className="card-content">
          {this.state.detailsCardContent}
        </div>
        <div className="card-footer">
          <button type="button" className="btn btn-xs btn-outline btn-secondary" onClick={()=>this.clearDetailsCard()}>Close and clear selection</button>
        </div>
      </div>
    </div>


    return (
      <div className="graph-container" id="graph-container">
        <NetworkGraph
          data={this.state.data}
          width={this.state.width}
          height={this.state.height}
          clickNode={this.clickNode}
          clickLink={this.clickLink}
          reload={this.updateGraphOptions}
          relatedNodes={this.state.relatedNodes}
          relatedLinks={this.state.relatedLinks}
          clearSelected={this.state.clearSelectedNodes}
          />
        {legend}
        {detailsCard}
      </div>
    )
  }


}

export default GraphView;
