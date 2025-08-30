import React, { useState } from 'react';
import type { ChecklistItem, MasterChecklistItem } from '../types';
import { PlusIcon, CheckIcon, DownloadIcon } from './Icons';

declare var XLSX: any;

interface DailyChecklistProps {
    selectedDate: Date;
    items: ChecklistItem[];
    log: string;
    bestStreak: number;
    isToday: boolean;
    masterChecklist: MasterChecklistItem[];
    allCompletionData: Record<string, number[]>;
    allDailyLogs: Record<string, string>;
    onCompletionChange: (date: Date, updatedIds: number[]) => void;
    onMasterChecklistChange: (updatedMasterList: MasterChecklistItem[]) => void;
    onLogChange: (date: Date, text: string) => void;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({ 
    selectedDate, 
    items, 
    log, 
    bestStreak, 
    isToday,
    masterChecklist,
    allCompletionData,
    allDailyLogs,
    onCompletionChange,
    onMasterChecklistChange,
    onLogChange 
}) => {
    const [newItemText, setNewItemText] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    
    const handleToggleItem = (id: number) => {
        if (!isToday) return;

        const currentCompletedIds = items.filter(i => i.completed).map(i => i.id);
        const isAlreadyCompleted = currentCompletedIds.includes(id);
        
        const updatedIds = isAlreadyCompleted
            ? currentCompletedIds.filter(itemId => itemId !== id)
            : [...currentCompletedIds, id];
            
        onCompletionChange(selectedDate, updatedIds);
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemText.trim() && isToday) {
            const newItem: MasterChecklistItem = {
                id: Date.now(),
                text: newItemText.trim(),
            };
            onMasterChecklistChange([...masterChecklist, newItem]);
            setNewItemText('');
            setIsAddingItem(false);
        }
    };
    
    const handleExport = () => {
        const dates = [...new Set([...Object.keys(allCompletionData), ...Object.keys(allDailyLogs)])].sort();
        
        const dataForSheet = dates.map(dateStr => {
            const row: Record<string, any> = { 'Date': dateStr };
            const completedIds = new Set(allCompletionData[dateStr] || []);
            let completedCount = 0;

            masterChecklist.forEach(item => {
                const isCompleted = completedIds.has(item.id);
                row[item.text] = isCompleted ? '✅' : '❌';
                if (isCompleted) completedCount++;
            });

            const totalTasks = masterChecklist.length;
            row['Completion %'] = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
            row['Log'] = allDailyLogs[dateStr] || '';
            
            return row;
        });

        if (dataForSheet.length === 0) {
            alert("No data available to export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Progress');

        const columnWidths = masterChecklist.map(item => ({ wch: Math.max(item.text.length, 10) }));
        worksheet['!cols'] = [{wch: 12}, ...columnWidths, {wch: 15}, {wch: 50}];

        XLSX.writeFile(workbook, 'daily_focus_progress.xlsx');
    };

    const logDate = selectedDate.toLocaleString('default', { month: 'short', day: 'numeric' });

    return (
        <div className="flex flex-col gap-6 h-full">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-3">Daily Checklist</h3>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            <button
                                onClick={() => handleToggleItem(item.id)}
                                disabled={!isToday}
                                aria-label={`Mark ${item.text} as ${item.completed ? 'incomplete' : 'complete'}`}
                                className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                                    ${item.completed ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-slate-300'}
                                    ${!isToday ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {item.completed && <CheckIcon />}
                            </button>
                            <span className={`flex-grow ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'} ${!isToday ? 'text-slate-500' : ''}`}>
                                {item.text}
                            </span>
                        </div>
                    ))}
                     {items.length === 0 && <p className="text-sm text-slate-500">No items in your checklist. Add one for today!</p>}
                </div>
                 <div className="mt-4">
                    {isAddingItem ? (
                        <form onSubmit={handleAddItem} className="flex gap-2">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                placeholder="New item..."
                                className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                autoFocus
                                onBlur={() => { if(!newItemText) setIsAddingItem(false)}}
                            />
                            <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Add</button>
                        </form>
                    ) : (
                        <button 
                            onClick={() => setIsAddingItem(true)} 
                            disabled={!isToday}
                            className="w-full text-left flex items-center gap-2 p-2 rounded-lg text-green-600 hover:bg-green-50 font-medium disabled:text-slate-400 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                            <PlusIcon />
                            Add New Item
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-end">
                <div className="p-3 bg-slate-100 rounded-lg text-sm text-slate-600">
                    <label htmlFor="daily-log" className="font-semibold">{logDate}:</label>
                    <input
                        id="daily-log"
                        type="text"
                        value={log}
                        onChange={(e) => onLogChange(selectedDate, e.target.value)}
                        placeholder={isToday ? "Log your achievements..." : "No log for this day."}
                        className="w-full bg-transparent outline-none p-1 disabled:cursor-not-allowed"
                        disabled={!isToday}
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex-1 border border-slate-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-500">Best Streak</p>
                    <p className="text-2xl font-bold text-slate-800">{bestStreak} days</p>
                </div>
                <button onClick={handleExport} className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-lg p-4 text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-colors">
                    <DownloadIcon />
                    <span className="text-sm font-medium">Download Excel</span>
                </button>
            </div>
        </div>
    );
};