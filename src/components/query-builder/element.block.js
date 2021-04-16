import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import {
  queryBuildMainAdd,
  queryBuildMainUpdate,
  queryBuildMainRemove,
} from '../../redux/actions';

const ElementBlock = (props) => {
  const dispatch = useDispatch();
  const { elements, add, index, defaultValues } = props;
  const [elementName, setElementName] = useState('');
  const [elementType, setElementType] = useState('');
  const [elementValue, setElementValue] = useState('');
  const [elementStartValue, setElementStartValue] = useState('');
  const [elementEndValue, setElementEndValue] = useState('');
  const [qualifier, setQualifier] = useState('contains');
  const [boolean, setBoolean] = useState('and');

  useEffect(() => {
    if (elements !== null) {
      const defaultElement = elements[0];
      setElementName(defaultElement.name);
      setElementType(defaultElement.type);
    }
  }, [elements]);

  useEffect(() => {
    if (defaultValues !== null) {
      const element = elements.find(
        (e) => e.name === defaultValues.elementLabel
      );
      setElementName(defaultValues.elementLabel);
      setElementType(element.type);
      setElementValue(defaultValues.elementValue);
      setElementStartValue(defaultValues.elementStartValue);
      setElementEndValue(defaultValues.elementEndValue);
      setQualifier(defaultValues.qualifier);
      setBoolean(defaultValues.boolean);
    }
  }, [defaultValues, elements]);

  const updateElementName = (value) => {
    const element = elements.find((e) => e.name === value);
    let newQualifier = qualifier;
    let newElementValue = elementValue;
    setElementName(value);
    setElementType(element.type);
    if (element.type === 'list' && elementValue === '') {
      newQualifier = 'exact';
      newElementValue = element.values[0].value || '';
      setQualifier(newQualifier);
      setElementValue(newElementValue);
    }
    const values = {
      elementLabel: value,
      qualifier: newQualifier,
      elementValue: newElementValue,
      elementStartValue,
      elementEndValue,
      boolean,
    };
    dispatch(queryBuildMainUpdate(index, values));
  };

  const updateElementValue = (e) => {
    const { value } = e.target;
    setElementValue(value);
    const values = {
      elementLabel: elementName,
      qualifier,
      elementValue: value,
      elementStartValue,
      elementEndValue,
      boolean,
    };
    dispatch(queryBuildMainUpdate(index, values));
  };

  const handleDateChange = (name, value) => {
    const values = {
      elementLabel: elementName,
      qualifier,
      elementValue,
      elementStartValue,
      elementEndValue,
      boolean,
    };
    if (name === 'start') {
      setElementStartValue(value);
      values.elementStartValue = value;
    }
    if (name === 'end') {
      setElementEndValue(value);
      values.elementEndValue = value;
    }
    dispatch(queryBuildMainUpdate(index, values));
  };

  const updateBooleanValue = (value) => {
    setBoolean(value);
    const values = {
      elementLabel: elementName,
      qualifier,
      elementValue,
      elementStartValue,
      elementEndValue,
      boolean: value,
    };
    dispatch(queryBuildMainUpdate(index, values));
  };

  let elementHTML;
  let qualifierOptions = [
    <option value="contains" key={1}>
      contains
    </option>,
    <option value="exact" key={2}>
      is exact match
    </option>,
    <option value="not_contains" key={3}>
      doesn&apos;t contain
    </option>,
    <option value="not_exact" key={4}>
      Is not exact match
    </option>,
  ];
  if (elementType === 'number') {
    elementHTML = (
      <Input
        className="select-value"
        name="elementValue"
        type="number"
        min="0"
        value={elementValue}
        onChange={(e) => updateElementValue(e)}
        placeholder="0"
      />
    );
  }
  if (elementType === 'text') {
    elementHTML = (
      <Input
        className="select-value"
        name="elementValue"
        type="text"
        value={elementValue}
        onChange={(e) => updateElementValue(e)}
        placeholder="Enter value..."
      />
    );
  }
  if (elementType === 'list') {
    const element = elements.find((e) => e.name === elementName);
    const elementValues = element.values || [];
    const options = elementValues.map((v) => (
      <option key={v.value} value={v.value}>
        {v.label}
      </option>
    ));
    elementHTML = (
      <Input
        className="select-value"
        name="elementValue"
        type="select"
        value={elementValue}
        onChange={(e) => updateElementValue(e)}
      >
        {options}
      </Input>
    );
    qualifierOptions = [
      <option value="exact" key={2}>
        is exact match
      </option>,
      <option value="not_exact" key={4}>
        is not exact match
      </option>,
    ];
  }
  if (elementType === 'date') {
    if (qualifier !== 'range') {
      elementHTML = (
        <DatePicker
          className="form-control query-builder-date"
          placeholderText="dd/mm/yyyy"
          selected={elementStartValue}
          onChange={(val) => handleDateChange('start', val)}
          dateFormat="dd/MM/yyyy"
          showMonthDropdown
          showYearDropdown
        />
      );
    } else {
      elementHTML = [
        <DatePicker
          key="start"
          className="form-control query-builder-date"
          placeholderText="dd/mm/yyyy"
          selected={elementStartValue}
          onChange={(val) => handleDateChange('start', val)}
          dateFormat="dd/MM/yyyy"
          showMonthDropdown
          showYearDropdown
        />,
        <DatePicker
          key="end"
          className="form-control query-builder-date"
          placeholderText="dd/mm/yyyy"
          selected={elementEndValue}
          onChange={(val) => handleDateChange('end', val)}
          dateFormat="dd/MM/yyyy"
          showMonthDropdown
          showYearDropdown
        />,
      ];
    }
    qualifierOptions = [
      <option value="exact" key={1}>
        exact
      </option>,
      <option value="before" key={2}>
        before
      </option>,
      <option value="after" key={3}>
        after
      </option>,
      <option value="range" key={4}>
        range
      </option>,
    ];
  }

  const elementLabelOptions = elements.map((e) => (
    <option key={e.name} value={e.name}>
      {e.name}
    </option>
  ));

  const addRow = () => {
    if (
      elementValue === '' &&
      elementStartValue === '' &&
      elementEndValue === ''
    ) {
      return false;
    }
    const values = {
      elementLabel: elementName,
      qualifier,
      elementValue,
      elementStartValue,
      elementEndValue,
      boolean,
    };
    // clear values
    const defaultElement = elements[0];
    setElementName(defaultElement.name);
    setElementType(defaultElement.type);
    setElementValue('');
    setElementStartValue('');
    setElementEndValue('');
    setQualifier('contains');
    setBoolean('and');
    dispatch(queryBuildMainAdd(values));
    return false;
  };

  const formSubmit = (e) => {
    e.preventDefault();
    addRow();
  };

  const removeRow = () => {
    dispatch(queryBuildMainRemove(index));
  };

  const btn = add ? (
    <InputGroupAddon addonType="append">
      <Button color="secondary" outline onClick={() => addRow()}>
        <i className="fa fa-plus" />
      </Button>
    </InputGroupAddon>
  ) : (
    <InputGroupAddon addonType="append">
      <Button color="secondary" outline onClick={() => removeRow()}>
        <i className="fa fa-minus" />
      </Button>
    </InputGroupAddon>
  );

  return (
    <Form onSubmit={(e) => formSubmit(e)}>
      <FormGroup className="query-builder-group">
        <InputGroup>
          <Input
            className="select-element"
            name="elementLabel"
            type="select"
            value={elementName}
            onChange={(e) => updateElementName(e.target.value)}
          >
            {elementLabelOptions}
          </Input>
          <Input
            className="select-qualifier"
            name="qualifier"
            type="select"
            value={qualifier}
            onChange={(e) => setQualifier(e.target.value)}
          >
            {qualifierOptions}
          </Input>
          {elementHTML}
          <Input
            className="select-boolean"
            name="boolean"
            type="select"
            value={boolean}
            onChange={(e) => updateBooleanValue(e.target.value)}
          >
            <option value="and">And</option>
            <option value="or">Or</option>
          </Input>
          {btn}
        </InputGroup>
      </FormGroup>
    </Form>
  );
};

ElementBlock.defaultProps = {
  add: false,
  index: -1,
  elements: [],
  defaultValues: null,
};

ElementBlock.propTypes = {
  add: PropTypes.bool,
  index: PropTypes.number,
  elements: PropTypes.array,
  defaultValues: PropTypes.object,
};
export default ElementBlock;
