
import React from 'react';
import type { ActivityData } from '../types';

interface CalendarProps {
    currentDate: Date;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    activityData: ActivityData;
}

const getActivityColor = (level: number | undefined): string => {
    if (level === undefined) return 'bg-white hover:bg-slate-100';
    switch (level) {
        case 1: return 'bg-green-100 hover:bg-green-200';
        case 2: return 'bg-green-300 hover:bg-green-400';
        case 3: return 'bg-green-500 hover:bg-green-600';
        case 4: return 'bg-green-700 hover:bg-green-800';
        default: return 'bg-white hover:bg-slate-100';
    }
};

export const Calendar: React.FC<CalendarProps> = ({ currentDate, selectedDate, onDateSelect, activityData }) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday is 0

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="border border-slate-200 rounded-md bg-slate-50 aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const isSelected = selectedDate.toDateString() === date.toDateString();
        const activity = activityData[dateStr];
        
        const colorClass = getActivityColor(activity?.level);
        const selectedClasses = 'bg-green-700 text-white font-bold ring-2 ring-green-800 ring-offset-2';
        const textClass = activity?.level && activity.level > 2 && !isSelected ? 'text-white' : 'text-slate-600';

        days.push(
            <button
                key={day}
                onClick={() => onDateSelect(date)}
                className={`p-2 border border-slate-200 rounded-md flex items-center justify-center transition-all duration-200 aspect-square
                    ${isSelected ? selectedClasses : `${colorClass} ${textClass}`}`}
            >
                {day}
            </button>
        );
    }
    
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="w-full">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm">
                {days}
            </div>
        </div>
    );
};
