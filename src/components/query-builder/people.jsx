import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Input,
  Spinner,
} from 'reactstrap';
import PropTypes from 'prop-types';
import useDebounce from '../../helpers/debounce';
import { getThumbnailURL } from '../../helpers';
import defaultThumbnail from '../../assets/img/spcc.jpg';
import icpThumbnail from '../../assets/img/icp-logo.jpg';

const APIPath = process.env.REACT_APP_APIPATH;

const RelatedPeople = (props) => {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState('');
  const debouncedLabel = useDebounce(label, 500);
  const limit = 25;
  const [loading, setLoading] = useState(true);
  const [loadMoreVisible, setLoadMoreVisible] = useState(false);
  const { open, toggleModalOpen, toggleVisibleFilter, updateItems } = props;
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [visibleItemsNum, setVisibleItemsNum] = useState(0);

  // selected related values
  const [selectedPeople, setSelectedPeople] = useState([]);

  useEffect(() => {
    const load = async () => {
      const responseData = await axios({
        method: 'get',
        url: `${APIPath}people`,
        crossDomain: true,
        params: {
          page,
          limit,
          label,
          orderField: 'lastName',
        },
      })
        .then((response) => response.data)
        .catch((error) => {
          console.log(error);
        });
      setLoading(false);
      const results = responseData.data.data;
      const itemsCopy = [...items, ...results];
      let visibleItems = limit * page;
      const responseTotalItems = Number(responseData.data.totalItems);
      if (visibleItems > responseTotalItems) {
        visibleItems = responseTotalItems;
      }
      setItems(itemsCopy);
      setVisibleItemsNum(visibleItems);
      setTotalItems(responseTotalItems);
      if (page < responseData.data.totalPages) {
        setLoadMoreVisible(true);
      }
    };
    if (loading) {
      load();
    }
  }, [label, limit, loading, items, page]);

  const handleSearch = (e) => {
    const { value } = e.target;
    setLabel(value);
  };

  useEffect(() => {
    if (debouncedLabel.length > 1) {
      setItems([]);
      setLoading(true);
    }
  }, [debouncedLabel]);

  const clearSearch = () => {
    setLabel('');
    setPage(1);
    setItems([]);
    setLoading(true);
  };

  const loadMorePeople = () => {
    let pageCopy = page;
    setPage((pageCopy += 1));
    setLoading(true);
  };

  const submit = () => {
    toggleModalOpen('people');
    toggleVisibleFilter('people');
    updateItems({ name: 'people', value: selectedPeople });
  };

  const toggleSelectedPerson = (item) => {
    const selectedPeopleCopy = Object.assign([], selectedPeople);
    const inArray = selectedPeopleCopy.find((i) => i._id === item._id) || false;
    if (inArray) {
      const index = selectedPeopleCopy.findIndex((i) => i._id === item._id);
      selectedPeopleCopy.splice(index, 1);
    } else {
      selectedPeopleCopy.push(item);
    }
    setSelectedPeople(selectedPeopleCopy);
  };
  const loadingMoreVisible = loading ? '' : 'hidden';
  const loadingMore = (
    <Spinner color="info" size="sm" className={loadingMoreVisible} />
  );
  const loadMoreVisibleClass = loadMoreVisible ? '' : 'hidden';
  const list = items.map((item, i) => {
    let thumbnailImage = [];
    const thumbnailURL = getThumbnailURL(item);
    if (thumbnailURL !== null) {
      thumbnailImage = [
        <img
          key="small"
          src={thumbnailURL}
          className="thumbnail"
          alt={item.label}
        />,
        <img
          key="large"
          src={thumbnailURL}
          className="thumbnail-large"
          alt={item.label}
        />,
      ];
    } else {
      const isinICP =
        item.resources.find((r) =>
          r.ref.label.includes('Liam Chambers and Sarah Frank')
        ) || null;
      if (isinICP) {
        thumbnailImage = (
          <img
            key="small"
            src={icpThumbnail}
            className="thumbnail"
            alt={item.label}
          />
        );
      } else {
        thumbnailImage = (
          <img
            key="small"
            src={defaultThumbnail}
            className="thumbnail"
            alt={item.label}
          />
        );
      }
    }
    let itemLabel = '';
    if (item.lastName !== '') {
      itemLabel += item.lastName;
    }
    if (item.firstName !== '') {
      if (itemLabel !== '') {
        itemLabel += ', ';
      }
      itemLabel += item.firstName;
    }
    if (item.middleName !== '') {
      if (itemLabel !== '') {
        itemLabel += ' ';
      }
      itemLabel += item.middleName;
    }
    let affiliation = '';
    if (item.affiliations?.length > 0) {
      const affText =
        item.affiliations.map((a) => a.ref.label).join(',') || null;
      if (affText !== null) {
        affiliation = affText;
      }
    }
    if (affiliation !== '') {
      affiliation = `[${affiliation}]`;
    }
    const inArray = selectedPeople.find((s) => s._id === item._id) || false;
    const badgeIcon = inArray ? (
      <i className="fa fa-times" />
    ) : (
      <i className="fa fa-plus" />
    );
    const active = inArray ? ' active' : '';
    return (
      <div key={item._id} className={`event-list-item${active}`}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td rowSpan="2" className="event-list-item-thumbnail-container">
                {thumbnailImage}
              </td>
              <td className="event-list-item-label-container">{itemLabel}</td>
              <td rowSpan="2" className="event-list-item-action-container">
                <Badge color="info" onClick={() => toggleSelectedPerson(item)}>
                  {badgeIcon}
                </Badge>
              </td>
            </tr>
            <tr>
              <td className="affiliation-block">{affiliation}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  });

  const selectedHeading =
    selectedPeople.length > 0 ? <h4>Selected people</h4> : '';
  const selectedPeopleOutput = selectedPeople.map((item, i) => {
    let itemLabel = '';
    if (item.lastName !== '') {
      itemLabel += item.lastName;
    }
    if (item.firstName !== '') {
      if (itemLabel !== '') {
        itemLabel += ', ';
      }
      itemLabel += item.firstName;
    }
    if (item.middleName !== '') {
      if (itemLabel !== '') {
        itemLabel += ' ';
      }
      itemLabel += item.middleName;
    }
    let affiliation = '';
    if (item.affiliations?.length > 0) {
      const affText =
        item.affiliations.map((a) => a.ref.label).join(',') || null;
      if (affText !== null) {
        affiliation = affText;
      }
    }
    if (affiliation !== '') {
      affiliation = ` [${affiliation}]`;
    }
    return (
      <Badge key={item._id} color="secondary">
        {itemLabel}
        {affiliation}
        <span
          className="remove-item"
          onClick={() => toggleSelectedPerson(item)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle selected person"
        >
          <i className="fa fa-times" />
        </span>
      </Badge>
    );
  });

  return (
    <Modal isOpen={open} toggle={() => toggleModalOpen('people')}>
      <ModalHeader toggle={() => toggleModalOpen('people')}>
        Related people
      </ModalHeader>
      <ModalBody>
        <div className="selected-items-container">
          {selectedHeading}
          {selectedPeopleOutput}
        </div>
        <h4>Select Person</h4>
        <FormGroup className="autocomplete-search">
          <Input
            type="text"
            name="searchItem"
            placeholder="Search..."
            value={label}
            onChange={handleSearch}
          />
          <div
            className="close-icon"
            onClick={() => clearSearch()}
            onKeyDown={() => false}
            role="button"
            tabIndex={0}
            aria-label="clear search"
          >
            <i className="fa fa-times" />
          </div>
        </FormGroup>
        <div className="events-list-container">{list}</div>
        <Button
          className={loadMoreVisibleClass}
          color="secondary"
          outline
          size="sm"
          block
          onClick={() => loadMorePeople()}
        >
          Load more {loadingMore}
        </Button>
        <div className="list-legend">
          <span className="heading">Showing:</span>
          <span className="text">
            {visibleItemsNum}/{totalItems}
          </span>
        </div>
      </ModalBody>
      <ModalFooter className="modal-footer">
        <Button color="info" outline onClick={() => submit()}>
          Ok
        </Button>
        <Button
          color="secondary"
          outline
          onClick={() => toggleModalOpen('people')}
          className="pull-left"
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

RelatedPeople.defaultProps = {
  open: false,
  toggleModalOpen: () => {},
  toggleVisibleFilter: () => {},
  updateItems: () => {},
};

RelatedPeople.propTypes = {
  open: PropTypes.bool,
  toggleModalOpen: PropTypes.func,
  toggleVisibleFilter: PropTypes.func,
  updateItems: PropTypes.func,
};
export default RelatedPeople;
