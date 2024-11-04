import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { parseISO, format } from 'date-fns';
import { Booking } from '../types/booking';
import { loadAllBookings } from '../services/bookingService';
import TableView from './TableView';
import FilterPanel from './FilterPanel';
import { isValidRoomType } from '../utils/typeGuards';
import type { FilterState } from '../types/booking';
import './Calendar.css';


interface ViewToggleProps {
  currentView: 'calendar' | 'table';
  onViewChange: (view: 'calendar' | 'table') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 mb-4">
      <button
        onClick={() => onViewChange('calendar')}
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${currentView === 'calendar'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        Calendar View
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${currentView === 'table'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        Table View
      </button>
    </div>
  );
};

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  classNames: string[];
  extendedProps: {
    booking: Booking;
  };
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'calendar' | 'table'>('calendar');
  const [filters, setFilters] = useState<FilterState>({
    status: {
      CONFIRMED: true,
      CANCELLED: true
    },
    roomType: {
      'MEETING ROOM': true,
      'DISCUSSION ROOM': true,
      'CONFERENCE ROOM': true
    },
    brand: {
        'COLAB': true,
        'ITCD': true
      }
    });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const { confirmed, cancelled } = await loadAllBookings();
        
        const allBookings = [...confirmed, ...cancelled];
        
        const calendarEvents = allBookings.map(booking => {
          const startDateTime = `${booking.date}T${booking.start_time}`;
          const endDateTime = `${booking.date}T${booking.end_time}`;
          
          const classNames = [
            `room-type-${booking.type.toLowerCase().replace(/\s+/g, '-')}`,
            `booking-status-${booking.status.toLowerCase()}`
          ];
          
          return {
            id: booking.uuid,
            title: `${booking.name}`,
            start: startDateTime,
            end: endDateTime,
            classNames,
            extendedProps: {
              booking
            }
          };
        });

        setAllEvents(calendarEvents);
        setEvents(calendarEvents);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load bookings: ${errorMessage}`);
        console.error('Error loading bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    const filteredEvents = allEvents.filter(event => {
        const booking = event.extendedProps.booking;
        const bookingBrand = booking.code.includes('COLAB') ? 'COLAB' : 'ITCD';
        
        return (
          filters.status[booking.status] && 
          isValidRoomType(booking.type) && filters.roomType[booking.type] &&
          filters.brand[bookingBrand]
        );
      });
    setEvents(filteredEvents);
  }, [filters, allEvents]);

  // Add brand-specific statistics
  const getBrandStatistics = () => {
    const stats = {
      COLAB: {
        total: 0,
        confirmed: 0,
        cancelled: 0
      },
      ITCD: {
        total: 0,
        confirmed: 0,
        cancelled: 0
      }
    };

    events.forEach(event => {
      const booking = event.extendedProps.booking;
      const brand = booking.code.includes('COLAB') ? 'COLAB' : 'ITCD';
      
      stats[brand].total++;
      if (booking.status === 'CONFIRMED') {
        stats[brand].confirmed++;
      } else {
        stats[brand].cancelled++;
      }
    });

    return stats;
  };

  const handleEventClick = (info: any) => {
    const booking = info.event.extendedProps.booking;
    alert(`
      Room: ${booking.name}
      Type: ${booking.type}
      Status: ${booking.status}
      Date: ${booking.date}
      Time: ${booking.start_time} - ${booking.end_time}
    `);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  const brandStats = getBrandStatistics();

  return (
    <div className="p-4">
      
      {/* Enhanced Statistics Section */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
            <p className="text-3xl font-bold text-gray-900">{events.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-green-700">Confirmed</h3>
            <p className="text-3xl font-bold text-green-900">
              {events.filter(e => e.extendedProps.booking.status === 'CONFIRMED').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-orange-700">Cancelled</h3>
            <p className="text-3xl font-bold text-orange-900">
              {events.filter(e => e.extendedProps.booking.status === 'CANCELLED').length}
            </p>
          </div>
        </div>

        {/* Brand-specific Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">CoLab</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{brandStats.COLAB.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-xl font-bold text-green-600">{brandStats.COLAB.confirmed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-xl font-bold text-orange-600">{brandStats.COLAB.cancelled}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-purple-700 mb-2">ITCD</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{brandStats.ITCD.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-xl font-bold text-green-600">{brandStats.ITCD.confirmed}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-xl font-bold text-orange-600">{brandStats.ITCD.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FilterPanel filters={filters} onFilterChange={setFilters} />
      <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {currentView === 'calendar' ? (
        <div className="bg-white rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            initialDate="2022-11-01"
            events={events}
            eventClick={handleEventClick}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth'
            }}
            eventContent={(eventInfo) => {
              const booking = eventInfo.event.extendedProps.booking;
              return (
                <div className={`event-content p-1 ${eventInfo.event.classNames.join(' ')}`}>
                  <p className="text-sm font-semibold truncate">
                    {booking.name}
                  </p>
                  <p className="text-xs">
                    {format(parseISO(eventInfo.event.start?.toISOString() || ''), 'HH:mm')} - 
                    {format(parseISO(eventInfo.event.end?.toISOString() || ''), 'HH:mm')}
                  </p>
                  {booking.status === 'CANCELLED' && (
                    <p className="text-xs italic">Cancelled</p>
                  )}
                </div>
              );
            }}
          />
        </div>
      ) : (
        <TableView 
          bookings={events.map(event => event.extendedProps.booking)}
          filters={filters}
        />
      )}
    </div>
  );
};

export default Calendar;