export function isValidRoomType(type: string): type is 'MEETING ROOM' | 'DISCUSSION ROOM' | 'CONFERENCE ROOM' {
    return ['MEETING ROOM', 'DISCUSSION ROOM', 'CONFERENCE ROOM'].includes(type);
  }