
import React from 'react';
import { CalendarIcon, StatsIcon, SettingsIcon } from './Icons';

export const BottomNav: React.FC = () => {
    return (
        <nav className="flex items-center justify-around border-t border-slate-200 py-2">
            <button className="flex flex-col items-center gap-1 text-green-600 font-medium relative">
                <CalendarIcon />
                <span className="text-xs">Calendar</span>
                <div className="absolute -bottom-2 w-10 h-1 bg-green-600 rounded-full"></div>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-green-600">
                <StatsIcon />
                <span className="text-xs">Stats</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-green-600">
                <SettingsIcon />
                <span className="text-xs">Settings</span>
            </button>
        </nav>
    );
};
