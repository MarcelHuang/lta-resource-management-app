import React from 'react';

interface FilterState {
  status: {
    CONFIRMED: boolean;
    CANCELLED: boolean;
  };
  roomType: {
    'MEETING ROOM': boolean;
    'DISCUSSION ROOM': boolean;
    'CONFERENCE ROOM': boolean;
  };
  brand: {
    'COLAB': boolean;
    'ITCD': boolean;
  };
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleStatusChange = (status: keyof typeof filters.status) => {
    onFilterChange({
      ...filters,
      status: {
        ...filters.status,
        [status]: !filters.status[status]
      }
    });
  };

  const handleRoomTypeChange = (roomType: keyof typeof filters.roomType) => {
    onFilterChange({
      ...filters,
      roomType: {
        ...filters.roomType,
        [roomType]: !filters.roomType[roomType]
      }
    });
  };

  const handleBrandChange = (brand: keyof typeof filters.brand) => {
    onFilterChange({
      ...filters,
      brand: {
        ...filters.brand,
        [brand]: !filters.brand[brand]
      }
    });
  };

  const resetFilters = () => {
    onFilterChange({
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
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={resetFilters}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          Reset Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filters */}
        <div>
          <h4 className="font-medium mb-2">Booking Status</h4>
          <div className="space-y-2">
            {Object.entries(filters.status).map(([status, checked]) => (
              <label key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleStatusChange(status as keyof typeof filters.status)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Room Type Filters */}
        <div>
          <h4 className="font-medium mb-2">Room Type</h4>
          <div className="space-y-2">
            {Object.entries(filters.roomType).map(([type, checked]) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleRoomTypeChange(type as keyof typeof filters.roomType)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filters */}
        <div>
          <h4 className="font-medium mb-2">Brand</h4>
          <div className="space-y-2">
            {Object.entries(filters.brand).map(([brand, checked]) => (
              <label key={brand} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleBrandChange(brand as keyof typeof filters.brand)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;