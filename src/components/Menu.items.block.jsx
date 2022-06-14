import React from 'react';
import PropTypes from 'prop-types';

function Item(props) {
  const { item, toggle } = props;

  const toggleChildren = (_id) => {
    const elem = document.getElementById(`menu-item-${_id}`);
    const { childNodes: children = [] } = elem;
    const { length } = children;
    let childrenContainer = null;
    let labelContainer = null;
    for (let i = 0; i < length; i += 1) {
      const child = children[i];
      if (child.classList.contains('menu-item-children-container')) {
        childrenContainer = child;
      }
      if (child.classList.contains('menu-item-label')) {
        labelContainer = child;
      }
    }
    if (childrenContainer !== null) {
      if (labelContainer !== null) {
        let iconContainer = null;
        const { childNodes: iconContainerChildren = [] } = labelContainer;
        const { length: icLength } = iconContainerChildren;
        for (let j = 0; j < icLength; j += 1) {
          const child = iconContainerChildren[j];
          if (child.classList.contains('menu-item-icon')) {
            iconContainer = child;
            break;
          }
        }
        if (iconContainer !== null) {
          const icon = iconContainer.querySelector('i.fa');
          if (childrenContainer.classList.contains('open')) {
            icon.classList.remove('fa-minus-square');
            icon.classList.add('fa-plus-square');
          } else {
            icon.classList.remove('fa-plus-square');
            icon.classList.add('fa-minus-square');
          }
        }
      }
      childrenContainer.classList.toggle('open');
    }
  };

  let iconHTML = (
    <div className="menu-item-icon no-link">
      <i className="fa fa-minus" />
    </div>
  );
  let children = [];
  let childrenHTML = [];
  if (item.children.length > 0) {
    iconHTML = (
      <div
        className="menu-item-icon"
        onClick={() => toggleChildren(item._id)}
        onKeyDown={() => false}
        role="button"
        tabIndex={0}
        aria-label="toggle children"
      >
        <i className="fa fa-minus-square" />
      </div>
    );
    children = item.children.map((child, index) => (
      <Item item={child} key={child._id} i={index} toggle={toggle} />
    ));
    childrenHTML = (
      <div className="menu-item-children-container open">
        <div className="menu-item-children-border" />
        <div className="menu-item-children-items">{children}</div>
      </div>
    );
  }
  const block = (
    <div className="menu-item" id={`menu-item-${item._id}`}>
      <div className="menu-item-label">
        {iconHTML}
        <div
          className="menu-item-text"
          onClick={() => toggle(item._id)}
          onKeyDown={() => false}
          role="button"
          tabIndex={0}
          aria-label="toggle"
        >
          {item.label}
        </div>
      </div>
      {childrenHTML}
    </div>
  );
  return block;
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  toggle: PropTypes.func.isRequired,
};

function ArticleCategoriesItems(props) {
  const { toggle, items } = props;

  const menuItems = items.map((item) => (
    <Item item={item} key={item._id} toggle={toggle} />
  ));

  return <div className="menu-items-container">{menuItems}</div>;
}
ArticleCategoriesItems.defaultProps = {
  toggle: () => {},
  items: [],
};
ArticleCategoriesItems.propTypes = {
  toggle: PropTypes.func,
  items: PropTypes.array,
};

export default ArticleCategoriesItems;
