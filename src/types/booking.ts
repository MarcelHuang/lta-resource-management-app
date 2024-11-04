export interface Booking {
    uuid: string;
    status: 'CONFIRMED' | 'CANCELLED';
    date: string;
    start_time: string;
    end_time: string;
    user_uuid: string;
    name: string;
    code: string;
    type: string;
  }
  
  export interface BookingsByDate {
    [date: string]: Booking[];
  }
  
  export interface ParsedBookings {
    confirmed: Booking[];
    cancelled: Booking[];
  }