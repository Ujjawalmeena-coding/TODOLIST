
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface HeaderProps {
    currentDate: Date;
    setCurrentDate: (date: Date) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentDate, setCurrentDate }) => {
    const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    return (
        <header className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
                 <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <h1 className="text-lg font-bold text-slate-800">Daily Focus</h1>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
                    <ChevronLeftIcon />
                </button>
                <h2 className="text-lg font-semibold text-slate-700 w-36 text-center">{monthYear}</h2>
                <button onClick={() => changeMonth(1)} className="p-1 rounded-md hover:bg-slate-100 text-slate-500">
                    <ChevronRightIcon />
                </button>
            </div>
            <div className="w-24 flex justify-end">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-sm font-semibold">
                    100%
                </div>
            </div>
        </header>
    );
};
