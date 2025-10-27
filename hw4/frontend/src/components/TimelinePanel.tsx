// TimelinePanel - FullCalendar integration for event timeline
import { useEffect, useRef, useMemo } from 'react';
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
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      const isHighlighted = highlightedEventId === event.id;
      return {
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        extendedProps: {
          notes: event.notes,
          places: event.places,
        },
        backgroundColor: isHighlighted ? '#fbbf24' : '#bfdbfe',
        borderColor: isHighlighted ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.2)',
        textColor: isHighlighted ? '#78350f' : '#1e3a8a',
        classNames: isHighlighted ? ['highlighted-event'] : [],
      };
    });
  }, [events, highlightedEventId]);

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
        initialView="timeGridThreeDay"
        headerToolbar={{
          left: 'prev',
          center: 'title',
          right: 'next',
        }}
        footerToolbar={{
          center: 'today',
        }}
        views={{
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            dateIncrement: { days: 1 },
            buttonText: '3 days',
          },
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

