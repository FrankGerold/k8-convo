import React from 'react';
import { Link } from 'react-router-dom';

export default () => {
  return (
    <div>
      <p>Another page for routing</p>
      <Link to="/">Go Home</Link>
    </div>
  );
};
