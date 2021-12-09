import React, { useCallback, useEffect, useState } from 'react';
import { getData } from '../helpers';

const TestView = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const load = useCallback(async () => {
    setLoading(false);
    const params = {
      page: 1,
      limit: 5,
      orderField: 'label',
      orderDesc: false,
      status: 'public',
    };
    const responseData = await getData(`articles`, params);
    return responseData;
  }, []);

  useEffect(() => {
    let unmount = false;
    if (loading && !unmount) {
      const update = async () => {
        const responseData = await load();
        const { data } = responseData;
        const { data: newItems } = data || [];
        setItems(newItems);
      };
      update();
    }
    return () => {
      unmount = true;
    };
  }, [loading, load]);

  const content =
    items.length > 0 ? (
      <ul>
        {items.map((i) => (
          <li key={i._id}>{i.label}</li>
        ))}
      </ul>
    ) : (
      []
    );
  const loadingText = loading ? 'Loading...' : content;
  const string = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()`;
  return (
    <div className="row">
      <div className="col-12">
        <h2>Test View</h2>
      </div>
      <div className="col-12">{loadingText}</div>
      <div className="col-12">{string.length}</div>
    </div>
  );
};
export default TestView;
