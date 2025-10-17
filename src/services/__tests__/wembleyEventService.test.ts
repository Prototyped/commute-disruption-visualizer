import { WembleyEventService, WembleyEvent, WembleyApiResponse } from '../wembleyEventService';

// Mock fetch globally
global.fetch = jest.fn();

describe('WembleyEventService', () => {
  let service: WembleyEventService;
  let mockFetch: jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new WembleyEventService();
    mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockClear();
  });

  const mockApiResponse: WembleyApiResponse = {
    totalCount: 2,
    results: [
      {
        document: {
          id: 'event1',
          brentItemTitle: 'Test Event 1',
          brentItemSummary: 'Test summary 1',
          brentItemDate: '2025-10-19T12:00:00+00:00',
          brentItemDisplayDate: '2025-10-19T13:00:00+01:00',
          brentItemVenue: ['Wembley Stadium'],
          brentItemEventType: ['Sport, health and fitness'],
          brentItemAddress: 'Wembley Stadium, Wembley, ',
          brentItemPostcode: 'HA9 0WS',
          brentItemUrl: '/events-in-brent/2025/october/test-event-1'
        }
      },
      {
        document: {
          id: 'event2',
          brentItemTitle: 'Test Event 2',
          brentItemSummary: 'Test summary 2',
          brentItemDate: '2025-11-01T12:00:00+00:00',
          brentItemDisplayDate: '2025-11-01T12:00:00+00:00',
          brentItemVenue: ['Wembley Stadium'],
          brentItemEventType: ['Film, theatre, dance and music'],
          brentItemAddress: 'Wembley Stadium, Wembley, ',
          brentItemPostcode: 'HA9 0WS',
          brentItemUrl: '/events-in-brent/2025/november/test-event-2'
        }
      }
    ]
  };

  describe('fetchWembleyEvents', () => {
    it('should fetch and process Wembley events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const events = await service.fetchWembleyEvents();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://gurdasani.com/brent-api/search/list',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'multipart/form-data; boundary=bucees'
          }
        })
      );

      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({
        id: 'event1',
        title: 'Test Event 1',
        summary: 'Test summary 1',
        date: '2025-10-19T12:00:00+00:00',
        displayDate: '2025-10-19T13:00:00+01:00',
        venue: ['Wembley Stadium'],
        eventType: ['Sport, health and fitness'],
        address: 'Wembley Stadium, Wembley, ',
        postcode: 'HA9 0WS',
        url: '/events-in-brent/2025/october/test-event-1'
      });
    });

    it('should create correct multipart form data format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      await service.fetchWembleyEvents();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      const requestBody = callArgs[1]?.body as string;

      // Verify the exact multipart format matches cURL command
      const expectedRequestBody = [
        '--bucees\r\n',
        'Content-Disposition: form-data; name="searchQuery"\r\n',
        '\r\n',
        '{"search":"","facets":["brent_item_venue","brent_item_area","brent_item_date"],"filter":"(brent_item_venue/any(t: t eq \'Wembley Stadium\')) and (template_1 eq \'7bcaf87fb19f48e28b09754cfa20468d\' or template_1 eq \'672bebc02617450aa2e13d4ea5042a4d\') and brent_item_has_layout and path_1/any(t:t eq \'110d559fdea542ea9c1c8a5df7e70ef9\')","orderBy":["brent_item_date"],"searchType":"Events","size":25,"orderDirection":"ASC"}\r\n',
        '--bucees--\r\n'
      ].join('');

      expect(requestBody).toBe(expectedRequestBody);
      
      // Verify proper line endings throughout
      expect(requestBody).toContain('\r\n');
      expect(requestBody).toMatch(/--bucees\r\n/);
      expect(requestBody).toMatch(/Content-Disposition: form-data; name="searchQuery"\r\n/);
      expect(requestBody).toMatch(/--bucees--\r\n$/); // Final boundary must end with CRLF
      
      // Verify no line is missing CRLF ending
      const lines = requestBody.split('\r\n');
      expect(lines[lines.length - 1]).toBe(''); // Last element should be empty (after final CRLF)
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      await expect(service.fetchWembleyEvents()).rejects.toThrow('Failed to fetch Wembley events');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.fetchWembleyEvents()).rejects.toThrow('Failed to fetch Wembley events');
    });
  });

  describe('isWembleyEventDay', () => {
    it('should return true for a date with events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const result = await service.isWembleyEventDay(new Date('2025-10-19'));

      expect(result.isEventDay).toBe(true);
      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Test Event 1');
    });

    it('should return false for a date without events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const result = await service.isWembleyEventDay(new Date('2025-12-25'));

      expect(result.isEventDay).toBe(false);
      expect(result.events).toHaveLength(0);
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.isWembleyEventDay(new Date('2025-10-19'));

      expect(result.isEventDay).toBe(false);
      expect(result.events).toHaveLength(0);
    });
  });

  describe('getNextWembleyEvent', () => {
    beforeEach(() => {
      // Mock current date to be before all events
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return the next upcoming event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const nextEvent = await service.getNextWembleyEvent();

      expect(nextEvent).not.toBeNull();
      expect(nextEvent?.title).toBe('Test Event 1');
      expect(nextEvent?.date).toBe('2025-10-19T12:00:00+00:00');
    });

    it('should return null when no upcoming events', async () => {
      // Mock system time to be after all events
      jest.setSystemTime(new Date('2025-12-01'));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      } as Response);

      const nextEvent = await service.getNextWembleyEvent();

      expect(nextEvent).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const nextEvent = await service.getNextWembleyEvent();

      expect(nextEvent).toBeNull();
    });
  });
});