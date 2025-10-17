/**
 * Service for fetching and processing Wembley Stadium event data
 */

export interface WembleyEvent {
  id: string;
  title: string;
  summary: string;
  date: string; // ISO date string
  displayDate: string; // ISO date string
  venue: string[];
  eventType: string[];
  address: string;
  postcode: string;
  url: string;
}

export interface WembleyApiResponse {
  totalCount: number;
  results: Array<{
    document: {
      id: string;
      brentItemTitle: string;
      brentItemSummary: string;
      brentItemDate: string;
      brentItemDisplayDate: string;
      brentItemVenue: string[];
      brentItemEventType: string[];
      brentItemAddress: string;
      brentItemPostcode: string;
      brentItemUrl: string;
    };
  }>;
}

export class WembleyEventService {
  private readonly apiUrl = 'https://gurdasani.com/brent-api/search/list';

  /**
   * Fetch upcoming Wembley Stadium events
   */
  async fetchWembleyEvents(): Promise<WembleyEvent[]> {
    try {
      const searchQuery = {
        search: "",
        facets: ["brent_item_venue", "brent_item_area", "brent_item_date"],
        filter: "(brent_item_venue/any(t: t eq 'Wembley Stadium')) and (template_1 eq '7bcaf87fb19f48e28b09754cfa20468d' or template_1 eq '672bebc02617450aa2e13d4ea5042a4d') and brent_item_has_layout and path_1/any(t:t eq '110d559fdea542ea9c1c8a5df7e70ef9')",
        orderBy: ["brent_item_date"],
        searchType: "Events",
        size: 25,
        orderDirection: "ASC"
      };

      // Create multipart form data manually with exact format from cURL command
      // Every line must end with carriage return + line feed (\r\n)
      const boundary = 'bucees';
      const crlf = '\r\n';
      
      const formData = [
        `--${boundary}${crlf}`,
        `Content-Disposition: form-data; name="searchQuery"${crlf}`,
        `${crlf}`,
        `${JSON.stringify(searchQuery)}${crlf}`,
        `--${boundary}--${crlf}`
      ].join('');

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': `multipart/form-data; boundary=${boundary}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WembleyApiResponse = await response.json();
      return this.processWembleyEvents(data);
    } catch (error) {
      console.error('Error fetching Wembley events:', error);
      throw new Error(`Failed to fetch Wembley events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process raw API response into normalized WembleyEvent objects
   */
  private processWembleyEvents(apiResponse: WembleyApiResponse): WembleyEvent[] {
    return apiResponse.results.map(result => {
      const doc = result.document;
      return {
        id: doc.id,
        title: doc.brentItemTitle,
        summary: doc.brentItemSummary,
        date: doc.brentItemDate,
        displayDate: doc.brentItemDisplayDate,
        venue: doc.brentItemVenue,
        eventType: doc.brentItemEventType,
        address: doc.brentItemAddress,
        postcode: doc.brentItemPostcode,
        url: doc.brentItemUrl
      };
    });
  }

  /**
   * Check if a given date is a Wembley event day
   */
  async isWembleyEventDay(date: Date): Promise<{ isEventDay: boolean; events: WembleyEvent[] }> {
    try {
      const events = await this.fetchWembleyEvents();
      const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      // Filter events that occur on the given date
      const todaysEvents = events.filter(event => {
        const eventDate = new Date(event.date).toISOString().split('T')[0];
        return eventDate === dateString;
      });

      return {
        isEventDay: todaysEvents.length > 0,
        events: todaysEvents
      };
    } catch (error) {
      console.error('Error checking Wembley event day:', error);
      return { isEventDay: false, events: [] };
    }
  }

  /**
   * Get the next upcoming Wembley event
   */
  async getNextWembleyEvent(): Promise<WembleyEvent | null> {
    try {
      const events = await this.fetchWembleyEvents();
      const now = new Date();
      
      // Find the next event that hasn't passed yet
      const upcomingEvents = events.filter(event => new Date(event.date) >= now);
      
      return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
    } catch (error) {
      console.error('Error getting next Wembley event:', error);
      return null;
    }
  }
}