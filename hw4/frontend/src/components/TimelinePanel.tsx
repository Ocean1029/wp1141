// TimelinePanel - FullCalendar integration for event timeline
import { useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Event } from '../types/event';
import '../styles/TimelinePanel.css';

interface TimelinePanelProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, start: Date, end: Date) => void;
  highlightedEventId?: string | null;
}

export function TimelinePanel({
  events,
  onEventClick,
  onDateSelect,
  onEventDrop,
  highlightedEventId,
}: TimelinePanelProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Convert events to FullCalendar format
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.startTime,
    end: event.endTime,
    extendedProps: {
      notes: event.notes,
      places: event.places,
    },
    backgroundColor: highlightedEventId === event.id ? '#fbbf24' : '#6366f1',
    borderColor: highlightedEventId === event.id ? '#f59e0b' : '#4f46e5',
  }));

  useEffect(() => {
    // Scroll to highlighted event
    if (highlightedEventId && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(highlightedEventId);
      if (event) {
        calendarApi.gotoDate(event.start!);
      }
    }
  }, [highlightedEventId]);

  return (
    <div className="timeline-panel">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height="100%"
        timeZone="local"
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        
        // Event handlers
        select={(info) => {
          if (onDateSelect) {
            onDateSelect(info.start, info.end);
          }
        }}
        eventClick={(info) => {
          const eventId = info.event.id;
          const event = events.find(e => e.id === eventId);
          if (event && onEventClick) {
            onEventClick(event);
          }
        }}
        eventDrop={(info) => {
          if (onEventDrop && info.event.start && info.event.end) {
            onEventDrop(info.event.id, info.event.start, info.event.end);
          }
        }}
        eventResize={(info) => {
          if (onEventDrop && info.event.start && info.event.end) {
            onEventDrop(info.event.id, info.event.start, info.event.end);
          }
        }}
      />
    </div>
  );
}

