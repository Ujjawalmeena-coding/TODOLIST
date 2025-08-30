import React from 'react';
import type { ActivityData } from '../types';

interface ContributionGraphProps {
    activityData: ActivityData;
    year: number;
}

const getActivityColor = (level: number | undefined): string => {
    if (level === undefined) return 'bg-slate-200';
    switch (level) {
        case 1: return 'bg-green-100';
        case 2: return 'bg-green-300';
        case 3: return 'bg-green-500';
        case 4: return 'bg-green-700';
        default: return 'bg-slate-200';
    }
};

export const ContributionGraph: React.FC<ContributionGraphProps> = ({ activityData, year }) => {
    const daysInYear = [];
    const startDate = new Date(year, 0, 1);
    const dayOfWeekOffset = (startDate.getDay() + 6) % 7; // Monday is 0

    // Add empty placeholders for days before Jan 1st
    for (let i = 0; i < dayOfWeekOffset; i++) {
        daysInYear.push(<div key={`empty-start-${i}`} className="w-3 h-3" />);
    }

    const endDate = new Date(year, 11, 31);
    const dateIterator = new Date(startDate);
    while (dateIterator <= endDate) {
        const dateStr = dateIterator.toISOString().split('T')[0];
        const activity = activityData[dateStr];
        const color = getActivityColor(activity?.level);
        daysInYear.push(<div key={dateStr} className={`w-3 h-3 rounded-sm ${color}`} title={`${dateStr}: Level ${activity?.level || 0}`} />);
        dateIterator.setDate(dateIterator.getDate() + 1);
    }
    
    return (
        <div className="hidden md:flex flex-col p-4 bg-slate-100 rounded-lg">
            <div className="grid grid-rows-7 grid-flow-col gap-1">
                {daysInYear}
            </div>
        </div>
    );
};
