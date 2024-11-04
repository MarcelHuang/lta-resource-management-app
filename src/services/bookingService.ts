import { Booking, ParsedBookings } from '../types/booking';


// Define color constants
const COLORS = {
    MEETING_ROOM: {
      base: '#4CAF50', // Green
      border: '#388E3C',
    },
    DISCUSSION_ROOM: {
      base: '#2196F3', // Blue
      border: '#1976D2',
    },
    CONFERENCE_ROOM: {
      base: '#9C27B0', // Purple
      border: '#7B1FA2',
    },
  };
  
  const STATUS_OPACITY = {
    CONFIRMED: '1',
    CANCELLED: '0.5',
  };
  
  function adjustColor(color: string, opacity: string): string {
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  export function getBookingColor(booking: Booking): { backgroundColor: string; borderColor: string; textColor: string } {
    let baseColors;
    switch (booking.type) {
      case 'MEETING ROOM':
        baseColors = COLORS.MEETING_ROOM;
        break;
      case 'DISCUSSION ROOM':
        baseColors = COLORS.DISCUSSION_ROOM;
        break;
      case 'CONFERENCE ROOM':
        baseColors = COLORS.CONFERENCE_ROOM;
        break;
      default:
        baseColors = COLORS.MEETING_ROOM; // Default fallback
    }
  
    const opacity = STATUS_OPACITY[booking.status] || '1';
  
    return {
      backgroundColor: adjustColor(baseColors.base, opacity),
      borderColor: adjustColor(baseColors.border, opacity),
      textColor: booking.status === 'CANCELLED' ? '#666666' : '#FFFFFF',
    };
  }


async function fetchCsvFile(filename: string): Promise<string> {
  try {
    console.log(`Fetching ${filename}...`);
    // Add the base URL prefix
    const response = await fetch(`/lta-resource-management-app/csv_files/${filename}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${filename}, status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log(`Successfully loaded ${filename}, length: ${text.length}`);
    // Log the first few lines to verify content
    console.log(`First few lines of ${filename}:`, text.split('\n').slice(0, 2));
    return text;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

function parseCsvText(csvText: string, filename: string): Booking[] {
  try {
    const lines = csvText.split('\n');
    console.log(`Parsing ${filename}, found ${lines.length} lines`);
    
    if (lines.length < 2) {
      console.warn(`${filename} appears to be empty or malformed`);
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`Headers found in ${filename}:`, headers);

    const bookings = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',');
        const booking: any = {};
        
        headers.forEach((header, i) => {
          booking[header] = values[i]?.trim() || '';
        });
        
        return booking as Booking;
      });

    console.log(`Successfully parsed ${bookings.length} bookings from ${filename}`);
    return bookings;
  } catch (error) {
    console.error(`Error parsing ${filename}:`, error);
    throw error;
  }
}

export async function loadAllBookings(): Promise<ParsedBookings> {
  try {
    console.log('Starting to load all booking files...');
    
    // Load all CSV files
    const [colabText, xcolabText, itcdText, xitcdText] = await Promise.all([
      fetchCsvFile('colab.csv'),
      fetchCsvFile('xcolab.csv'),
      fetchCsvFile('itcd.csv'),
      fetchCsvFile('xitcd.csv')
    ]);

    // Parse each CSV file
    const colabBookings = parseCsvText(colabText, 'colab.csv');
    const xcolabBookings = parseCsvText(xcolabText, 'xcolab.csv');
    const itcdBookings = parseCsvText(itcdText, 'itcd.csv');
    const xitcdBookings = parseCsvText(xitcdText, 'xitcd.csv');

    const result = {
      confirmed: [...colabBookings, ...itcdBookings],
      cancelled: [...xcolabBookings, ...xitcdBookings]
    };

    console.log('Finished loading all bookings:', {
      confirmedCount: result.confirmed.length,
      cancelledCount: result.cancelled.length
    });

    return result;
  } catch (error) {
    console.error('Error in loadAllBookings:', error);
    throw error;
  }
}