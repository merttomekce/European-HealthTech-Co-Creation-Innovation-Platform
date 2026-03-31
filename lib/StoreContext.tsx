'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { announcements as initialData, Announcement } from './data';

export interface Interest {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole: string;
  userExpertise: string;
  message: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  timestamp: string;
}

export interface TimeSlot {
  id: string;
  label: string; // e.g., "Monday, 4:00 PM - 5:00 PM"
  status: 'Proposed' | 'Confirmed';
}

export interface Meeting {
  id: string;
  interestId: string;
  projectId: string;
  status: 'Negotiation' | 'Scheduled' | 'Completed';
  slots: TimeSlot[];
  confirmedSlotId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'Message' | 'StatusUpdate' | 'Meeting';
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  link?: string;
}


interface StoreContextType {
  announcements: Announcement[];
  interests: Interest[];
  meetings: Meeting[];
  notifications: Notification[];
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncementStatus: (id: string, status: Announcement['status']) => void;
  addInterest: (interest: Omit<Interest, 'id' | 'status' | 'timestamp'>) => void;
  updateInterestStatus: (id: string, status: Interest['status']) => void;
  proposeMeetingSlots: (interestId: string, projectId: string, slots: string[]) => void;
  confirmMeetingSlot: (meetingId: string, slotId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => void;
  markNotificationsAsRead: (userId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialInterests: Interest[] = [
  {
    id: 'int-1',
    projectId: '1', // AI-assisted ECG
    userId: 'user-eng-1',
    userName: 'Mark Zuckerberg', // Just for fun, or better 'Mark Nilsson'
    userRole: 'Senior ML Engineer',
    userExpertise: 'Signal processing, PyTorch',
    message: 'I have extensive experience with time-series data from wearables. Would love to help with the ECG interpretation modules.',
    status: 'Pending',
    timestamp: '2 hours ago'
  },
  {
    id: 'int-2',
    projectId: '2', // Pressure-responsive scaffold
    userId: 'user-eng-2',
    userName: 'Elena Rodriguez',
    userRole: 'Materials Scientist',
    userExpertise: '3D Printing, Biopolymers',
    message: 'I specialize in piezo-electric polymers. This project aligns perfectly with my recent research at ETH Zurich.',
    status: 'Accepted',
    timestamp: 'Yesterday'
  }
];

const initialMeetings: Meeting[] = [];

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-current',
    type: 'StatusUpdate',
    title: 'Application Accepted',
    message: 'Your application for "Pressure-responsive scaffold" was accepted. You can now propose meeting times.',
    isRead: false,
    timestamp: '1 hour ago',
    link: '/my-requests'
  }
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialData);
  const [interests, setInterests] = useState<Interest[]>(initialInterests);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = (notifData: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotif: Notification = {
      ...notifData,
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      isRead: false,
      timestamp: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, isRead: true } : n));
  };

  const addAnnouncement = (newA: Announcement) => {
    setAnnouncements(prev => [newA, ...prev]);
  };

  const updateAnnouncementStatus = (id: string, status: Announcement['status']) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const addInterest = (interestData: Omit<Interest, 'id' | 'status' | 'timestamp'>) => {
    const newInterest: Interest = {
      ...interestData,
      id: `int-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Pending',
      timestamp: 'Just now'
    };
    setInterests(prev => [newInterest, ...prev]);
  };

  const updateInterestStatus = (id: string, status: Interest['status']) => {
    setInterests(prev => prev.map(i => {
      if (i.id === id) {
        if (status === 'Accepted') {
          addNotification({
            userId: i.userId,
            type: 'StatusUpdate',
            title: 'Application Accepted',
            message: 'Your application was accepted by the project lead. Please propose meeting slots.',
            link: '/my-requests'
          });
        }
        return { ...i, status };
      }
      return i;
    }));
  };

  const proposeMeetingSlots = (interestId: string, projectId: string, slotLabels: string[]) => {
    const newMeeting: Meeting = {
      id: `mtg-${Math.random().toString(36).substr(2, 9)}`,
      interestId,
      projectId,
      status: 'Negotiation',
      slots: slotLabels.map(label => ({
        id: `slot-${Math.random().toString(36).substr(2, 9)}`,
        label,
        status: 'Proposed'
      }))
    };
    setMeetings(prev => [...prev, newMeeting]);
    
    // Notify the lead
    addNotification({
      userId: 'lead-current', // In a real app, look up the project owner ID
      type: 'Meeting',
      title: 'Meeting Slots Proposed',
      message: 'An applicant has proposed times for an interdisciplinary sync.',
      link: '/my-announcements'
    });
  };

  const confirmMeetingSlot = (meetingId: string, slotId: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        
        // Notify the applicant
        addNotification({
          userId: m.interestId, // Assuming interestId is tied to the user for this demo
          type: 'Meeting',
          title: 'Meeting Time Confirmed',
          message: 'Your proposed meeting time has been confirmed by the clinical lead.',
          link: '/my-requests'
        });

        return {
          ...m,
          status: 'Scheduled',
          confirmedSlotId: slotId,
          slots: m.slots.map(s => ({
            ...s,
            status: s.id === slotId ? 'Confirmed' : s.status
          }))
        };
      }
      return m;
    }));
  };

  return (
    <StoreContext.Provider value={{ 
      announcements, 
      interests,
      meetings,
      notifications,
      addAnnouncement, 
      updateAnnouncementStatus,
      addInterest,
      updateInterestStatus,
      proposeMeetingSlots,
      confirmMeetingSlot,
      addNotification,
      markNotificationsAsRead
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
