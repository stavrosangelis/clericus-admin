import React from 'react';
import {
  Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const DeleteMany = (props) => {
  const submit = () => {
    props.deleteSelected();
    props.toggle();
  }
  let selectedItems = [];
  if (props.type==="Person") {
    selectedItems = props.items.map(item=> {
      let name = "";
      if (typeof item.honorificPrefix!=="undefined" && item.honorificPrefix!=="") {
        name += item.honorificPrefix+" ";
      }
      if (typeof item.firstName!=="undefined" && item.firstName!=="") {
        name += item.firstName+" ";
      }
      if (typeof item.middleName!=="undefined" && item.middleName!=="") {
        name += item.middleName+" ";
      }
      if (typeof item.lastName!=="undefined" && item.lastName!=="") {
        name += item.lastName+" ";
      }
      return <li key={item._id}>
        <span>{name} [{item._id}]</span>
        <span className="remove-item-from-list" onClick={()=>props.removeSelected(item._id)}><i className="fa fa-times-circle" /></span>
      </li>
    });
  }
  else {
    selectedItems = props.items.map(item=> {
      return <li key={item._id}>
        <span>{item.label} [{item._id}]</span>
        <span className="remove-item-from-list" onClick={()=>props.removeSelected(item._id)}><i className="fa fa-times-circle" /></span>
      </li>
    });
  }
  if (selectedItems.length>0) {
    selectedItems = <ul className="selected-items-list">{selectedItems}</ul>
  }
  return (
    <Modal isOpen={props.visible} toggle={props.toggle}>
      <ModalHeader toggle={props.toggle}>Confirm delete</ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>Selected items</label>
          <p>The following items will be deleted. Continue?</p>
          {selectedItems}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" size="sm" onClick={()=>submit()}><i className="fa fa-trash-o" /> Delete</Button>
        <Button color="secondary" className="pull-left" size="sm" onClick={props.toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  )
}

export default DeleteMany;
