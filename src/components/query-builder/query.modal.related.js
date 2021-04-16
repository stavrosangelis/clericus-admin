import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import elementsJson from './elements.json';
import ElementBlock from './element.related.block';
import {
  queryBuildRelatedClear,
  setPaginationParams,
  setQueryBuildResults,
  toggleClearQueryBuildResults,
} from '../../redux/actions';

const QueryModalRelated = (props) => {
  // props
  const {
    open,
    toggleModalOpen,
    queryBlocks,
    update,
    users,
    type: entityType,
  } = props;

  // state
  const [elements, setElements] = useState([]);

  let rstateName;
  let queryBuildName;
  switch (entityType) {
    case 'Event': {
      rstateName = 'queryBlocksEvent';
      queryBuildName = 'events';
      break;
    }
    case 'Organisation': {
      rstateName = 'queryBlocksOrganisation';
      queryBuildName = 'organisations';
      break;
    }
    case 'Person': {
      rstateName = 'queryBlocksPerson';
      queryBuildName = 'people';
      break;
    }
    case 'Resource': {
      rstateName = 'queryBlocksResource';
      queryBuildName = 'resources';
      break;
    }
    case 'Spatial': {
      rstateName = 'queryBlocksSpatial';
      queryBuildName = 'spatials';
      break;
    }
    case 'Temporal': {
      rstateName = 'queryBlocksTemporal';
      queryBuildName = 'temporals';
      break;
    }
    default: {
      rstateName = 'queryBlocksEvent';
      break;
    }
  }

  // redux
  const dispatch = useDispatch();
  const queryBuild = useSelector((state) => state.queryBuild);
  const eventTypes = useSelector((state) => state.eventTypes);
  const organisationTypes = useSelector((state) => state.organisationTypes);
  const personTypes = useSelector((state) => state.personTypes);
  const resourceTypes = useSelector((state) => state.resourcesTypes);

  useEffect(() => {
    if (entityType) {
      setElements(elementsJson[entityType]);
    }
  }, [entityType]);

  const parsePropTypes = useCallback(
    ({ elementName = null, types, sep = '' }) => {
      const typesDropdownItems = [];
      for (let i = 0; i < types.length; i += 1) {
        const item = types[i];
        const sepOut = sep !== '' ? ` ${sep} ` : '';
        const checkIds = ['eventType', 'user', 'systemType'];
        const checkLabelIds = ['organisationType', 'personType'];
        let activeTypeValue = item.value;
        if (checkIds.indexOf(elementName) > -1) {
          activeTypeValue = item._id;
        }
        if (checkLabelIds.indexOf(elementName) > -1) {
          activeTypeValue = item.labelId;
        }
        const returnItem = {
          label: `${sepOut}${item.label}`,
          value: activeTypeValue,
        };
        typesDropdownItems.push(returnItem);
        if (typeof item.children !== 'undefined' && item.children.length > 0) {
          const newSep = `${sep}-`;
          const childrenItems = parsePropTypes({
            elementName,
            types: item.children,
            sep: newSep,
          });
          for (let j = 0; j < childrenItems.length; j += 1) {
            const child = childrenItems[j];
            typesDropdownItems.push(child);
          }
        }
      }
      return typesDropdownItems;
    },
    []
  );

  // populate elements
  useEffect(() => {
    if (elements.findIndex((e) => e.name === 'eventType') > -1) {
      const eventTypeIndex = elements.findIndex((e) => e.name === 'eventType');
      const newEventTypes = parsePropTypes({
        elementName: 'eventType',
        types: eventTypes,
      });
      elements[eventTypeIndex].values = newEventTypes;
    }
    if (elements.findIndex((e) => e.name === 'organisationType') > -1) {
      const organisationTypeIndex = elements.findIndex(
        (e) => e.name === 'organisationType'
      );
      const newOrganisationTypes = parsePropTypes({
        elementName: 'organisationType',
        types: organisationTypes,
      });
      elements[organisationTypeIndex].values = newOrganisationTypes;
    }
    if (elements.findIndex((e) => e.name === 'personType') > -1) {
      const personTypeIndex = elements.findIndex(
        (e) => e.name === 'personType'
      );
      const newPersonTypes = parsePropTypes({
        elementName: 'personType',
        types: personTypes,
      });
      elements[personTypeIndex].values = newPersonTypes;
    }
    if (elements.findIndex((e) => e.name === 'systemType') > -1) {
      const resourceTypeIndex = elements.findIndex(
        (e) => e.name === 'systemType'
      );
      const newResourceTypeIndexs = parsePropTypes({
        elementName: 'systemType',
        types: resourceTypes,
      });
      elements[resourceTypeIndex].values = newResourceTypeIndexs;
    }
    if (
      elements.findIndex((e) => e.name === 'createdBy') > -1 ||
      elements.findIndex((e) => e.name === 'updatedBy') > -1
    ) {
      const createdByIndex = elements.findIndex((e) => e.name === 'createdBy');
      const updatedByIndex = elements.findIndex((e) => e.name === 'updatedBy');
      const list = parsePropTypes({ elementName: 'users', types: users });
      elements[createdByIndex].values = list;
      elements[updatedByIndex].values = list;
    }
  }, [
    elements,
    eventTypes,
    parsePropTypes,
    users,
    organisationTypes,
    personTypes,
    resourceTypes,
  ]);

  const blocks = queryBlocks.map((b, i) => {
    const key = `a${i}`;
    return (
      <ElementBlock
        key={key}
        index={i}
        elements={elements}
        defaultValues={b}
        name={rstateName}
      />
    );
  });

  useEffect(() => {
    dispatch(queryBuildRelatedClear(queryBuildName));

    // clear results list
    dispatch(setQueryBuildResults([]));
    dispatch(toggleClearQueryBuildResults(true));
    // reset pagination
    const paginationParams = {
      limit: 25,
      activeType: null,
      page: 1,
      orderField: 'label',
      orderDesc: false,
      status: null,
      total_pages: null,
    };
    dispatch(setPaginationParams('queryBuilder', paginationParams));
  }, [entityType, dispatch, queryBuild, rstateName, queryBuildName]);

  const submit = (e) => {
    e.preventDefault();
    toggleModalOpen(entityType);
    update(true);
  };

  const heading = entityType !== 'Person' ? `${entityType}s` : 'People';
  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => toggleModalOpen(entityType)}
        size="lg"
        className="query-builder-modal"
      >
        <ModalHeader toggle={() => toggleModalOpen(entityType)}>
          Related {heading}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Add query blocks</Label>
            <ElementBlock
              name={rstateName}
              key="default"
              elements={elements}
              add
            />
          </FormGroup>
          <br />
          {blocks}
        </ModalBody>
        <ModalFooter className="modal-footer">
          <Button color="info" outline onClick={(e) => submit(e)}>
            Ok
          </Button>
          <Button
            color="secondary"
            outline
            onClick={() => toggleModalOpen(entityType)}
            className="pull-left"
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
QueryModalRelated.defaultProps = {
  open: false,
  toggleModalOpen: () => {},
  queryBlocks: [],
  update: () => {},
  users: [],
  type: '',
};

QueryModalRelated.propTypes = {
  open: PropTypes.bool,
  toggleModalOpen: PropTypes.func,
  queryBlocks: PropTypes.array,
  update: PropTypes.func,
  users: PropTypes.array,
  type: PropTypes.string,
};
export default QueryModalRelated;
