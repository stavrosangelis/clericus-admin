import React, { useCallback, useEffect, useState } from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { loadRelationsOrganisationsValues } from '../../redux/actions';

function OrganisationsForm(props) {
  const { submit, clear, item, toggleItem } = props;

  const dispatch = useDispatch();
  const itemTypes = useSelector((state) => state.organisationTypes);

  const initEventTypeValue = { value: '', label: '--' };
  const [searchId, setSearchId] = useState('');
  const [searchLabel, setSearchLabel] = useState('');
  const [searchType, setSearchType] = useState(initEventTypeValue);

  const searchItems = useCallback(() => {
    dispatch(
      loadRelationsOrganisationsValues(searchId, searchLabel, searchType)
    );
  }, [dispatch, searchId, searchLabel, searchType]);

  const keypress = (e) => {
    if (e.which === 13) {
      searchItems();
    }
  };

  const clearSearchByKey = (key = null) => {
    let copyId = searchId;
    let copySearchItem = searchLabel;
    if (key !== null) {
      switch (key) {
        case 'searchId':
          copyId = '';
          break;
        case 'searchLabel':
          copySearchItem = '';
          break;
        default:
          break;
      }
      setSearchId(copyId);
      setSearchLabel(copySearchItem);
      dispatch(
        loadRelationsOrganisationsValues(copyId, copySearchItem, searchType)
      );
    }
  };

  const clearSearch = useCallback(() => {
    setSearchId('');
    setSearchLabel('');
    setSearchType('');
    dispatch(loadRelationsOrganisationsValues('', '', ''));
  }, [dispatch]);

  useEffect(() => {
    if (submit) {
      searchItems();
    }
  }, [submit, searchItems]);

  useEffect(() => {
    if (clear) {
      clearSearch();
    }
  }, [clear, clearSearch]);

  const typesList = (types = [], sep = '') => {
    const options = [];
    for (let i = 0; i < types.length; i += 1) {
      const itemType = types[i];
      const sepLabel = sep !== '' ? `${sep} ` : '';
      const option = {
        value: itemType._id,
        label: `${sepLabel}${itemType.label}`,
      };
      options.push(option);
      if (itemType.children.length > 0) {
        const newSep = `${sep}-`;
        const childOptions = typesList(itemType.children, newSep);
        for (let k = 0; k < childOptions.length; k += 1) {
          options.push(childOptions[k]);
        }
      }
    }

    return options;
  };

  const itemTypesItems = typesList(itemTypes);
  itemTypesItems.unshift(initEventTypeValue);

  let labelBlock = null;
  if (item !== null) {
    const { ref } = item;
    const { _id, label } = ref;
    labelBlock = (
      <div>
        <i>Selected organisation:</i>{' '}
        <Button
          type="button"
          color="info"
          size="sm"
          onClick={() => toggleItem(_id)}
        >
          {label}
        </Button>
      </div>
    );
  }

  return (
    <>
      {labelBlock}
      <FormGroup>
        <Label>Search for Organisation</Label>
      </FormGroup>
      <div className="row">
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchId"
              placeholder="Search organisation id..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchId')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search organisations input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
        <div className="col-6">
          <FormGroup className="autocomplete-search">
            <Input
              type="text"
              name="searchLabel"
              placeholder="Search organisation label..."
              value={searchLabel}
              onChange={(e) => setSearchLabel(e.target.value)}
              onKeyPress={keypress}
            />
            <div
              className="close-icon"
              onClick={() => clearSearchByKey('searchLabel')}
              onKeyDown={() => false}
              role="button"
              tabIndex={0}
              aria-label="clear search organisations input"
            >
              <i className="fa fa-times" />
            </div>
          </FormGroup>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <Select
            value={searchType}
            onChange={(selectedOption) => setSearchType(selectedOption)}
            options={itemTypesItems}
          />
        </div>
      </div>
    </>
  );
}
OrganisationsForm.defaultProps = {
  item: null,
  toggleItem: () => {},
};
OrganisationsForm.propTypes = {
  item: PropTypes.object,
  submit: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
  toggleItem: PropTypes.func,
};
export default OrganisationsForm;
