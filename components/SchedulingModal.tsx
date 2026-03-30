'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import styles from './SchedulingModal.module.css';

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropose: (slots: string[]) => void;
  projectTitle: string;
}

const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', 
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function SchedulingModal({ isOpen, onClose, onPropose, projectTitle }: SchedulingModalProps) {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const toggleSlot = (day: string, time: string) => {
    const slot = `${day}, ${time}`;
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(prev => prev.filter(s => s !== slot));
    } else if (selectedSlots.length < 3) {
      setSelectedSlots(prev => [...prev, slot]);
    }
  };

  const handlePropose = () => {
    if (selectedSlots.length === 3) {
      onPropose(selectedSlots);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="modal-header">
        <h2 style={{ fontSize: '1.5rem', color: 'var(--on-background-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Negotiate Meeting</h2>
        <h2>{projectTitle}</h2>
        <p>Propose 3 time slots for a 30-minute introductory sync. The project lead will select one to finalize.</p>
      </div>

      <div className={styles.schedulerGrid}>
        <div className={styles.timeColumn}>
          <div className={styles.timeHeader} />
          {timeSlots.map(t => (
            <div key={t} className={styles.timeLabel}>{t}</div>
          ))}
        </div>
        
        {days.map(day => (
          <div key={day} className={styles.dayColumn}>
            <div className={styles.dayHeader}>{day}</div>
            {timeSlots.map(time => {
              const slot = `${day}, ${time}`;
              const isSelected = selectedSlots.includes(slot);
              const isDisabled = selectedSlots.length >= 3 && !isSelected;
              return (
                <div 
                  key={time} 
                  className={`${styles.slotCell} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                  onClick={() => !isDisabled && toggleSlot(day, time)}
                >
                  {isSelected && <span className="material-symbols-outlined">check</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.selectionSummary}>
        <div className={styles.selectionCount}>
          {selectedSlots.length} / 3 slots selected
        </div>
        <button 
          className="modal-submit-btn" 
          disabled={selectedSlots.length < 3}
          onClick={handlePropose}
        >
          Propose Selected Slots
        </button>
      </div>
    </Modal>
  );
}
