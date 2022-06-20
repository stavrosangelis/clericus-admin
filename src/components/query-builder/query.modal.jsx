import React, { useEffect, useState, useCallback } from 'react';
import {
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
} from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import elementsJson from './elements.json';
import ElementBlock from './element.block';
import {
  setQueryBuildType,
  queryBuildMainClear,
  setPaginationParams,
  setQueryBuildResults,
  toggleClearQueryBuildResults,
} from '../../redux/actions';

function QueryModalMain(props) {
  // props
  const { open, toggleModalOpen, queryBlocks, entities, update, users } = props;

  // state
  const [entityTypeTemp, setEntityTypeTemp] = useState('Event');
  const [alertModal, setAlertModal] = useState(false);
  const [elements, setElements] = useState([]);

  // redux
  const dispatch = useDispatch();
  const entityType = useSelector((state) => state.queryBuildType);
  const queryBuildResults = useSelector((state) => state.queryBuildResults);
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
      <ElementBlock key={key} index={i} elements={elements} defaultValues={b} />
    );
  });

  const updateEntityType = (value) => {
    if (blocks.length > 0 || queryBuildResults?.nodes?.length > 0) {
      setAlertModal(true);
      setEntityTypeTemp(value);
      return false;
    }
    dispatch(setQueryBuildType(value));
    dispatch(queryBuildMainClear());
    return false;
  };

  const toggleAlertModal = () => {
    setAlertModal(!alertModal);
  };

  const updateEntityTypeConfirm = async () => {
    // clear results list
    await dispatch(setQueryBuildResults([]));
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
    dispatch(setQueryBuildType(entityTypeTemp));
    dispatch(queryBuildMainClear());
    toggleAlertModal();
  };

  const submit = (e) => {
    e.preventDefault();
    toggleModalOpen();
    update(true);
  };

  const entitiesOptions = entities.map((e) => (
    <option key={e._id} value={e.label}>
      {e.label}
    </option>
  ));

  return (
    <div>
      <Modal
        isOpen={open}
        toggle={() => toggleModalOpen()}
        size="lg"
        className="query-builder-modal"
      >
        <ModalHeader toggle={() => toggleModalOpen()}>Main query</ModalHeader>
        <ModalBody>
          <p>Use this form to set the parameters of your main query.</p>

          <FormGroup>
            <Label>Select the Entity Type</Label>
            <Input
              name="entityType"
              type="select"
              value={entityType}
              onChange={(e) => updateEntityType(e.target.value)}
            >
              {entitiesOptions}
            </Input>
          </FormGroup>
          <br />

          <FormGroup>
            <Label>Add query blocks</Label>
            <ElementBlock key="default" elements={elements} add />
          </FormGroup>
          <br />
          {blocks}
        </ModalBody>
        <ModalFooter className="flex justify-content-between">
          <Button
            color="secondary"
            outline
            onClick={() => toggleModalOpen()}
            className="pull-left"
          >
            Cancel
          </Button>
          <Button color="info" outline onClick={(e) => submit(e)}>
            Ok
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={alertModal}
        toggle={() => toggleAlertModal()}
        size="sm"
        backdrop="static"
        centered
      >
        <ModalBody>
          <div className="text-center">
            The existing query will be cleared! Continue?
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-content-between">
          <Button
            color="secondary"
            outline
            onClick={() => toggleAlertModal()}
            className="pull-left"
          >
            Cancel
          </Button>
          <Button
            color="info"
            outline
            onClick={() => updateEntityTypeConfirm()}
          >
            Ok
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
QueryModalMain.defaultProps = {
  open: false,
  toggleModalOpen: () => {},
  queryBlocks: [],
  entities: [],
  update: () => {},
  users: [],
};

QueryModalMain.propTypes = {
  open: PropTypes.bool,
  toggleModalOpen: PropTypes.func,
  queryBlocks: PropTypes.array,
  entities: PropTypes.array,
  update: PropTypes.func,
  users: PropTypes.array,
};
export default QueryModalMain;
