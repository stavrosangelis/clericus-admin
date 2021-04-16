import React from 'react';
import {
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import PropTypes from 'prop-types';

const DeleteMany = (props) => {
  // props
  const {
    deleteSelected,
    toggle,
    type,
    items,
    removeSelected,
    visible,
  } = props;
  const submit = () => {
    deleteSelected();
    toggle();
  };
  let selectedItems = [];
  if (type === 'Person') {
    selectedItems = items.map((item) => {
      let name = '';
      if (
        typeof item.honorificPrefix !== 'undefined' &&
        item.honorificPrefix !== ''
      ) {
        name += `${item.honorificPrefix} `;
      }
      if (typeof item.firstName !== 'undefined' && item.firstName !== '') {
        name += `${item.firstName} `;
      }
      if (typeof item.middleName !== 'undefined' && item.middleName !== '') {
        name += `${item.middleName} `;
      }
      if (typeof item.lastName !== 'undefined' && item.lastName !== '') {
        name += `${item.lastName} `;
      }
      return (
        <li key={item._id}>
          <span>
            {name} [{item._id}]
          </span>
          <span
            className="remove-item-from-list"
            onClick={() => removeSelected(item._id)}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="remove item from list"
          >
            <i className="fa fa-times-circle" />
          </span>
        </li>
      );
    });
  } else {
    selectedItems = props.items.map((item) => (
      <li key={item._id}>
        <span>
          {item.label} [{item._id}]
        </span>
        <span
          className="remove-item-from-list"
          onClick={() => removeSelected(item._id)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="remove item from list"
        >
          <i className="fa fa-times-circle" />
        </span>
      </li>
    ));
  }
  if (selectedItems.length > 0) {
    selectedItems = <ul className="selected-items-list">{selectedItems}</ul>;
  }
  return (
    <Modal isOpen={visible} toggle={toggle}>
      <ModalHeader toggle={toggle}>Confirm delete</ModalHeader>
      <ModalBody>
        <div className="form-group">
          <Label>Selected items</Label>
          <p>The following items will be deleted. Continue?</p>
          {selectedItems}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" size="sm" onClick={() => submit()}>
          <i className="fa fa-trash-o" /> Delete
        </Button>
        <Button
          color="secondary"
          className="pull-left"
          size="sm"
          onClick={toggle}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

DeleteMany.defaultProps = {
  deleteSelected: () => {},
  toggle: () => {},
  type: '',
  items: [],
  removeSelected: () => {},
  visible: false,
};

DeleteMany.propTypes = {
  deleteSelected: PropTypes.func,
  toggle: PropTypes.func,
  type: PropTypes.string,
  items: PropTypes.array,
  removeSelected: PropTypes.func,
  visible: PropTypes.bool,
};

export default DeleteMany;
