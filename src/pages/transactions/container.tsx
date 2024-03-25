import React from 'react';
import { Outlet } from 'react-router-dom';

const Container = () => (
  <div className="container mx-auto">
    <Outlet />
  </div>
);

export default Container;
