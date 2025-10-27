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
  onEventEdit?: (event: Event) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  onEventDrop?: (eventId: string, start: Date, end: Date) => void;
  highlightedEventId?: string | null;
}

export function TimelinePanel({
  events,
  onEventClick,
  onEventEdit,
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
        backgroundColor: isHighlighted ? '#fef3c7' : '#f9fafb',
        borderColor: isHighlighted ? '#fbbf24' : '#e5e7eb',
        textColor: isHighlighted ? '#78350f' : '#1f2937',
        classNames: isHighlighted ? ['highlighted-event'] : [],
      };
    });
  }, [events, highlightedEventId]);

  useEffect(() => {
    // Scroll to highlighted event without changing the view date
    if (highlightedEventId && calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const event = calendarApi.getEventById(highlightedEventId);
      if (event && event.start) {
        // Check if the event is within the current view
        const currentStart = calendarApi.view.currentStart;
        const currentEnd = calendarApi.view.currentEnd;
        const eventDate = event.start;
        
        // Only navigate if the event is outside the current view
        if (eventDate < currentStart || eventDate >= currentEnd) {
          calendarApi.gotoDate(eventDate);
        }
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
        slotDuration="00:15:00"
        slotLabelInterval="01:00:00"
        allDaySlot={false}
        forceEventDuration={true}
        displayEventTime={true}
        displayEventEnd={true}
        
        // Event handlers
        select={(info) => {
          if (onDateSelect) {
            onDateSelect(info.start, info.end);
          }
        }}
        eventContent={(arg) => {
          const eventId = arg.event.id;
          const event = events.find(e => e.id === eventId);
          
          return (
            <div className="fc-event-custom">
              <div className="fc-event-custom-content">
                <div className="fc-event-time">{arg.timeText}</div>
                <div className="fc-event-title">{arg.event.title}</div>
              </div>
              <button
                className="fc-event-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (event && onEventEdit) {
                    onEventEdit(event);
                  }
                }}
                title="Edit event"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          );
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

