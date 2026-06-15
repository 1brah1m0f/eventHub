export type EventMode = '' | 'online' | 'offline';
export type PriceFilter = '' | 'free' | 'paid';

export interface EventFilters {
  search: string;
  type: string;
  date_from: string;
  date_to: string;
  location: string;
  price: PriceFilter;
  event_mode: EventMode;
}

export const EMPTY_EVENT_FILTERS: EventFilters = {
  search: '',
  type: '',
  date_from: '',
  date_to: '',
  location: '',
  price: '',
  event_mode: '',
};

export function toEventQueryParams(filters: EventFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '')
  ) as Record<string, string>;
}

export function activeEventFilterCount(filters: EventFilters) {
  return Object.values(filters).filter(Boolean).length;
}

export function isInDateRange(event: { date?: string | null }, dateFrom: string, dateTo: string) {
  if (!dateFrom && !dateTo) return true;

  const eventTime = event.date ? new Date(event.date).getTime() : null;
  const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
  const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

  if (eventTime === null || Number.isNaN(eventTime)) return false;
  return (fromTime === null || eventTime >= fromTime) && (toTime === null || eventTime <= toTime);
}
