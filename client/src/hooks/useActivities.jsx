import { useState, useEffect } from 'react';

const ACTIVITIES_DB = 'sgc_activities_v1';
const UNREAD_COUNT_DB = 'sgc_unread_count_v1';

export function useActivities() {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem(ACTIVITIES_DB);
    return saved ? JSON.parse(saved) : [];
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    const saved = localStorage.getItem(UNREAD_COUNT_DB);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(ACTIVITIES_DB, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(UNREAD_COUNT_DB, unreadCount.toString());
  }, [unreadCount]);

  const addActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('pt-BR'),
      timestamp: new Date().toISOString(),
      unread: true,
      ...activity
    };
    setActivities(prev => [newActivity, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearActivities = () => {
    setActivities([]);
    setUnreadCount(0);
  };

  return {
    activities,
    unreadCount,
    addActivity,
    markAllAsRead,
    clearActivities
  };
}
