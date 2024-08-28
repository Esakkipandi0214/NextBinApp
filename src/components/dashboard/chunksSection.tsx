import React from 'react';
import DailyStatistics from './DailyStatistics';
import WeeklyStatistics from './WeeklyStatistics';
import MonthlyStatistics from './MonthlyStatistics';

const CustomerStatistics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <DailyStatistics />
      <WeeklyStatistics />
      <MonthlyStatistics />
    </div>
  );
};

export default CustomerStatistics;
