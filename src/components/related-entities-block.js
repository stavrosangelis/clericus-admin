import React, {useState} from 'react';
import PropTypes from 'prop-types';
import LazyList from './lazylist';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {
  Card, CardTitle, CardBody,
  Button,
  Collapse,
} from 'reactstrap';
import {getResourceThumbnailURL} from '../helpers/helpers';

const APIPath = process.env.REACT_APP_APIPATH;

const RelatedEntitiesBlock = props => {
  const item = props.item;
  const itemType = props.itemType;
  const [state,setState] = useState({
    eventsOpen: false,
    organisationsOpen: false,
    peopleOpen: false,
    resourcesOpen: false,
    spatialOpen: false,
    temporalOpen: false,
  });

  const deleteRef = async(ref, refTerm, model) => {
    let reference = {
      items: [
        {_id: item._id, type: itemType},
        {_id: ref, type: model},
      ],
      taxonomyTermLabel: refTerm,
    }
    const deleteItem = await axios({
      method: 'delete',
      url: APIPath+'reference',
      crossDomain: true,
      data: reference
    })
	  .then(function (response) {
      return response;
	  })
	  .catch(function (error) {
	  });
    if(deleteItem.data.status) {
      props.reload();
    }
  }

  const toggleCollapse = (name) => {
    let value = true;
    if (state[name]) {
      value = false;
    }
    const newState = Object.assign({},state);
    newState[name]= value;
    setState(newState);
  }

  var eventsBlock = [];
  var organisationsBlock = [];
  var peopleBlock = [];
  var resourcesBlock = [];
  var spatialBlock = [];
  var temporalBlock = [];

  if (item?.events?.length>0) {
    const renderEvent = (reference) => {
      let label = reference.ref.label;
      let _id = reference.ref._id;
      let url = `/event/${_id}`;
      let row = <div key={_id} className="ref-item">
        <Link to={url} href={url}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Event")}><i className="fa fa-times" /></div>
      </div>
      return row;
    }
    let eventsOpenActive = " active";
    if (!state.eventsOpen) {
      eventsOpenActive = "";
    }

    eventsBlock = <Card>
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('eventsOpen')}>Related events (<span className="related-num">{item.events.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+eventsOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.eventsOpen}>
          <LazyList
            limit={50}
            range={25}
            items={item.events}
            renderItem={renderEvent}
            />
        </Collapse>
      </CardBody>
    </Card>
  }

  if (item?.organisations?.length>0) {
    const renderOrganisation = (reference) => {
      let label = reference.ref.label;
      let _id = reference.ref._id;
      let url = `/organisation/${_id}`;
      let row = <div key={_id} className="ref-item">
        <Link to={url} href={url}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Organisation")}><i className="fa fa-times" /></div>
      </div>
      return row;
    }
    let organisationsOpenActive = " active";
    if (!state.organisationsOpen) {
      organisationsOpenActive = "";
    }
    organisationsBlock = <Card>
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('organisationsOpen')}>Related Organisations (<span className="related-num">{item.organisations.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+organisationsOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.organisationsOpen}>
          <LazyList
            limit={50}
            range={25}
            items={item.organisations}
            renderItem={renderOrganisation}
            />
        </Collapse>
      </CardBody>
    </Card>;
  }

  if (item?.people?.length>0) {
    const renderPerson = (reference) => {
      let label = reference.ref.label;
      let role = [];
      if (typeof reference.term.role!=="undefined" && reference.term.role!=="null") {
        role = <label>as {reference.term.roleLabel}</label>
      }
      let _id = reference.ref._id;
      let url = `/person/${_id}`;
      let row = <div key={_id} className="ref-item">
        <Link to={url} href={url}>
          <i>{reference.term.label}</i> <b>{label}</b> {role}
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Person")}><i className="fa fa-times" /></div>
      </div>
      return row;
    }

    let peopleOpenActive = " active";
    if (!state.peopleOpen) {
      peopleOpenActive = "";
    }
    peopleBlock = <Card>
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('peopleOpen')}>Related people (<span className="related-num">{item.people.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+peopleOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.peopleOpen}>
        <LazyList
          limit={50}
          range={25}
          items={item.people}
          renderItem={renderPerson}
          />
        </Collapse>
      </CardBody>
    </Card>
  }

  if (item?.resources?.length>0) {
    const renderResource = (reference) => {
      let thumbnailPath = getResourceThumbnailURL(reference.ref);
      let thumbnailImage = [];
      if (thumbnailPath!==null) {
        thumbnailImage = <img src={thumbnailPath} alt={reference.label} className="img-fluid"/>
      }
      let role = [];
      if (typeof reference.term.role!=="undefined" && reference.term.role!=="null") {
        role = <label>as {reference.term.roleLabel}</label>
      }
      let _id = reference.ref._id;
      let url = `/resource/${_id}`;
      let newRow = <div key={_id} className="img-thumbnail related-resource">
          <Link to={url} href={url}>
            <i>{reference.term.label}</i>
            {thumbnailImage}
            <label>{reference.ref.label}</label>
            {role}
          </Link>
          <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Resource")}><i className="fa fa-times" /></div>
        </div>
      return newRow;
    }

    let resourcesOpenActive = " active";
    if (!state.resourcesOpen) {
      resourcesOpenActive = "";
    }

    resourcesBlock = <Card>
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('resourcesOpen')}>Related resources (<span className="related-num">{item.resources.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+resourcesOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.resourcesOpen}>
        <LazyList
          limit={50}
          range={25}
          items={item.resources}
          containerClass="resources"
          renderItem={renderResource}
          />
        </Collapse>
      </CardBody>
    </Card>
  }

  if (item?.spatial?.length>0) {
    const renderSpatial = (reference) => {
      let label = reference.ref.label;
      let _id = reference.ref._id;
      let url = `/spatial/${_id}` ;
      let row = <div key={_id} className="ref-item">
        <Link to={url} href={url}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Spatial")}><i className="fa fa-times" /></div>
      </div>
      return row;
    }
    let spatialOpenActive = " active";
    if (!state.spatialOpen) {
      spatialOpenActive = "";
    }

    spatialBlock = <Card >
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('spatialOpen')}>Related spatial (<span className="related-num">{item.spatial.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+spatialOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.spatialOpen}>
        <LazyList
          limit={50}
          range={25}
          items={item.spatial}
          renderItem={renderSpatial}
          />
        </Collapse>
      </CardBody>
    </Card>
  }

  if (item?.temporal?.length>0) {
    const renderTemporal = (reference) => {
      let label = reference.ref.label;
      let _id = reference.ref._id;
      let url = `/temporal/${_id}`;
      let row = <div key={_id} className="ref-item">
        <Link to={url} href={url}>
          <i>{reference.term.label}</i> <b>{label}</b>
        </Link>
        <div className="delete-ref" onClick={()=>deleteRef(_id, reference.term.label, "Temporal")}><i className="fa fa-times" /></div>
      </div>
      return row;
    }
    let temporalOpenActive = " active";
    if (!state.temporalOpen) {
      temporalOpenActive = "";
    }
    temporalBlock = <Card>
      <CardBody>
        <CardTitle onClick={()=>toggleCollapse('temporalOpen')}>Related temporal (<span className="related-num">{item.temporal.length}</span>) <Button type="button" className="pull-right" color="secondary" outline size="xs"><i className={"collapse-toggle fa fa-angle-left"+temporalOpenActive} /></Button></CardTitle>
        <Collapse isOpen={state.temporalOpen}>
        <LazyList
          limit={50}
          range={25}
          items={item.temporal}
          renderItem={renderTemporal}
          />
        </Collapse>
      </CardBody>
    </Card>
  }

  return <div>
    {eventsBlock}
    {organisationsBlock}
    {peopleBlock}
    {resourcesBlock}
    {spatialBlock}
    {temporalBlock}
  </div>
}

RelatedEntitiesBlock.propTypes = {
  item: PropTypes.object,
  itemType: PropTypes.string,
  reload: PropTypes.func,
}

export default RelatedEntitiesBlock;
