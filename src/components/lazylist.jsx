import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

function LazyList(props) {
  const {
    limit: propsLimit,
    range: propsRange,
    items: propsItems,
    reload,
    scrollIndex,
    onScroll: onScrollFn,
    ordered,
    renderItem,
    containerClass,
    listClass,
  } = props;
  const limit = propsLimit || 50;
  const range = propsRange || 25;
  const itemsLength = propsItems.length || 0;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const container = useRef(null);
  const prevNodes = useRef([]);
  const prevScrollIndex = useRef(0);

  useEffect(() => {
    if (reload) {
      setLoading(true);
    }
  }, [reload]);

  useEffect(() => {
    if (prevNodes.current !== propsItems) {
      setLoading(true);
      prevNodes.current = propsItems;
    }
  }, [propsItems]);

  useEffect(() => {
    const load = () => {
      const newData = propsItems.slice(0, limit);
      setItems(newData);
      setLoading(false);
    };
    if (loading) {
      load();
    }
  }, [loading, propsItems, limit, items]);

  useEffect(() => {
    if (scrollIndex !== null) {
      if (scrollIndex !== prevScrollIndex.current) {
        prevScrollIndex.current = scrollIndex;
        let newStartIndex = 0;
        if (propsItems.length > limit) {
          newStartIndex = scrollIndex - limit / 2;
        }
        let endIndex = newStartIndex + limit;
        if (endIndex > propsItems.length) {
          endIndex = propsItems.length;
        }
        const newData = propsItems.slice(newStartIndex, endIndex);
        setItems(newData);
        setStartIndex(newStartIndex);
      }
    }
  }, [scrollIndex, propsItems, prevScrollIndex, limit, range, props]);

  useEffect(() => {
    const wrapper = container.current;
    let domElem = document.querySelector(
      `*[data-lazylist-index="${scrollIndex - 2}"]`
    );
    if (domElem === null) {
      domElem = document.querySelector(
        `*[data-lazylist-index="${scrollIndex - 1}"]`
      );
    }
    if (domElem === null) {
      domElem = document.querySelector(
        `*[data-lazylist-index="${scrollIndex}"]`
      );
    }
    if (domElem !== null) {
      const scrollPos = domElem.offsetTop;
      wrapper.scrollTop = scrollPos;
    }
  }, [scrollIndex, range]);

  const onScroll = () => {
    if (onScrollFn !== null) {
      return onScrollFn();
    }
    return false;
  };

  const reDrawList = () => {
    const wrapper = container.current;
    let newStartIndex = startIndex;
    let update = false;
    if (wrapper.scrollHeight === wrapper.scrollTop + wrapper.clientHeight) {
      if (startIndex + range <= itemsLength - limit + range) {
        newStartIndex = startIndex + range;
        update = true;
      }
    }
    if (wrapper.scrollTop === 0) {
      if (startIndex > range) {
        newStartIndex = startIndex - range;
        update = true;
      } else if (startIndex > 0) {
        newStartIndex = 0;
        update = true;
      }
    }
    if (update) {
      const endIndex = newStartIndex + limit;
      const newData = propsItems.slice(newStartIndex, endIndex + 1);
      setItems(newData);
      setStartIndex(newStartIndex);
      const domElem = wrapper.querySelector(
        `*[data-lazylist-index="${newStartIndex + range}"]`
      );
      if (domElem !== null) {
        const scrollPos = domElem.offsetTop;
        wrapper.scrollTop = scrollPos;
      }
    }
  };

  const list = [];
  if (!loading && items.length > 0) {
    let length = limit;
    if (length > items.length) {
      length = items.length;
    }
    for (let i = 0; i <= length; i += 1) {
      const item = items[i];
      if (typeof item !== 'undefined' && item !== null) {
        const index = i + startIndex;
        let order = '';
        if (ordered) {
          order = `${i + startIndex + 1}. `;
        }
        list.push(
          <li key={index} data-lazylist-index={index}>
            {order}
            {renderItem(item)}
          </li>
        );
      }
    }
  }

  let className = 'lazylist';
  let listClassName = '';
  if (containerClass !== '') {
    className += ` ${containerClass}`;
  }
  if (listClass !== '') {
    listClassName += ` ${listClass}`;
  }
  return (
    <div
      className={className}
      ref={container}
      onScroll={() => {
        reDrawList();
        onScroll();
      }}
      onWheel={() => {
        reDrawList();
        onScroll();
      }}
    >
      <ul className={listClassName}>{list}</ul>
    </div>
  );
}

LazyList.defaultProps = {
  limit: 50,
  range: 25,
  items: [],
  reload: () => {},
  containerClass: '',
  listClass: '',
  scrollIndex: null,
  onScroll: null,
  ordered: false,
};

LazyList.propTypes = {
  limit: PropTypes.number,
  range: PropTypes.number,
  items: PropTypes.array,
  reload: PropTypes.func,
  containerClass: PropTypes.string,
  listClass: PropTypes.string,
  renderItem: PropTypes.func.isRequired,
  onScroll: PropTypes.func,
  scrollIndex: PropTypes.number,
  ordered: PropTypes.bool,
};

export default LazyList;
