import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Assignments from './pages/Assignments';
import Planner from './pages/Planner';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="planner" element={<Planner />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="search" element={<Search />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
