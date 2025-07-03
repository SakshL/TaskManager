import { gapi } from 'gapi-script';

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  colorId?: string;
}

class GoogleCalendarService {
  private initialized = false;
  private signedIn = false;

  async initializeGapi(): Promise<void> {
    if (this.initialized) return;

    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', {
        callback: () => resolve(),
        onerror: () => reject(new Error('Failed to load GAPI'))
      });
    });

    await gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
      clientId: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
      discoveryDocs: [DISCOVERY_DOC],
      scope: SCOPES
    });

    this.initialized = true;
    this.signedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.initialized) {
        await this.initializeGapi();
      }

      const authInstance = gapi.auth2.getAuthInstance();
      if (!this.signedIn) {
        await authInstance.signIn();
      }
      
      this.signedIn = true;
      return true;
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.initialized && this.signedIn) {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.signedIn = false;
    }
  }

  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      if (!this.signedIn) {
        throw new Error('Not signed in to Google Calendar');
      }

      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || now.toISOString(),
        timeMax: timeMax || weekFromNow.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: 'startTime'
      });

      return response.result.items || [];
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    try {
      if (!this.signedIn) {
        throw new Error('Not signed in to Google Calendar');
      }

      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      if (!this.signedIn) {
        throw new Error('Not signed in to Google Calendar');
      }

      const response = await gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: event
      });

      return response.result;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      if (!this.signedIn) {
        throw new Error('Not signed in to Google Calendar');
      }

      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  }

  isSignedIn(): boolean {
    return this.signedIn;
  }
}

export const googleCalendarService = new GoogleCalendarService();
