import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Calendar } from './components/Calendar';
import { DailyChecklist } from './components/DailyChecklist';
import { BottomNav } from './components/BottomNav';
import type { ActivityData, ChecklistItem, MasterChecklistItem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [masterChecklist, setMasterChecklist] = useLocalStorage<MasterChecklistItem[]>('masterChecklist', []);
    const [completionData, setCompletionData] = useLocalStorage<Record<string, number[]>>('completionData', {});
    const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, string>>('dailyLogs', {});

    const getFormattedDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const activityData: ActivityData = useMemo(() => {
        const data: ActivityData = {};
        const totalTasks = masterChecklist.length;
        if (totalTasks === 0) return {};

        const allDates = new Set([...Object.keys(completionData), ...Object.keys(dailyLogs)]);

        allDates.forEach(dateStr => {
            const completedCount = (completionData[dateStr] || []).length;
            const hasLog = !!dailyLogs[dateStr]?.trim();
            const completionRatio = completedCount / totalTasks;

            let level = 0;
            if (completionRatio > 0 && completionRatio < 0.5) level = 1;
            else if (completionRatio >= 0.5 && completionRatio < 1) level = 2;
            else if (completionRatio === 1) level = 3;

            if (hasLog && level > 0) {
                level = Math.min(level + 1, 4);
            }
            if (level > 0) {
                data[dateStr] = { level };
            }
        });

        return data;
    }, [masterChecklist.length, completionData, dailyLogs]);

    const bestStreak = useMemo(() => {
        const totalTasks = masterChecklist.length;
        if (totalTasks === 0) return 0;

        const streakDates = Object.keys(completionData)
            .filter(dateStr => (completionData[dateStr] || []).length === totalTasks)
            .sort();
        
        if (streakDates.length === 0) return 0;

        let maxStreak = 0;
        let currentStreak = 0;
        let lastDate: Date | null = null;

        for (const dateStr of streakDates) {
            const currentDate = new Date(dateStr + 'T00:00:00');
            if (lastDate) {
                const diffTime = currentDate.getTime() - lastDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
            }
            lastDate = currentDate;
        }
        return maxStreak;
    }, [masterChecklist.length, completionData]);

    // Add some initial data for demonstration if storage is empty
    useEffect(() => {
        const storedMasterList = localStorage.getItem('masterChecklist');
        if (!storedMasterList || JSON.parse(storedMasterList).length === 0) {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const yesterdayStr = getFormattedDate(yesterday);
            
            const initialMasterList: MasterChecklistItem[] = [
                { id: Date.now(), text: 'Practice coding (LeetCode)'},
                { id: Date.now() + 1, text: 'Go for a run' }
            ];
            setMasterChecklist(initialMasterList);
            setCompletionData({
                [yesterdayStr]: initialMasterList.map(item => item.id)
            });
            setDailyLogs({
                [yesterdayStr]: 'Completed all my tasks yesterday!'
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleMasterChecklistChange = useCallback((updatedList: MasterChecklistItem[]) => {
        setMasterChecklist(updatedList);
    }, [setMasterChecklist]);

    const handleCompletionChange = useCallback((date: Date, updatedCompletedIds: number[]) => {
        const dateStr = getFormattedDate(date);
        setCompletionData(prev => ({ ...prev, [dateStr]: updatedCompletedIds }));
    }, [setCompletionData]);

    const handleLogChange = useCallback((date: Date, text: string) => {
        const dateStr = getFormattedDate(date);
        setDailyLogs(prev => ({ ...prev, [dateStr]: text }));
    }, [setDailyLogs]);

    const selectedDateStr = getFormattedDate(selectedDate);
    const selectedDayCompletions = completionData[selectedDateStr] || [];
    const selectedDayItems: ChecklistItem[] = masterChecklist.map(item => ({
        ...item,
        completed: selectedDayCompletions.includes(item.id)
    }));
    const selectedDayLog = dailyLogs[selectedDateStr] || '';
    const isToday = getFormattedDate(selectedDate) === getFormattedDate(new Date());
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50 p-2 sm:p-4">
            <main className="w-full max-w-5xl bg-white rounded-2xl shadow-lg flex flex-col h-[95vh]">
                <Header currentDate={currentDate} setCurrentDate={setCurrentDate} />
                <div className="flex-grow p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
                    <div className="lg:col-span-2">
                        <Calendar 
                            currentDate={currentDate} 
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            activityData={activityData}
                        />
                    </div>
                    <div className="lg:col-span-1">
                       <DailyChecklist
                            selectedDate={selectedDate}
                            items={selectedDayItems}
                            log={selectedDayLog}
                            onCompletionChange={handleCompletionChange}
                            onMasterChecklistChange={handleMasterChecklistChange}
                            onLogChange={handleLogChange}
                            bestStreak={bestStreak}
                            isToday={isToday}
                            masterChecklist={masterChecklist}
                            allCompletionData={completionData}
                            allDailyLogs={dailyLogs}
                        />
                    </div>
                </div>
                 <BottomNav />
            </main>
        </div>
    );
};

export default App;