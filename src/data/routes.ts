import { RouteDefinition, StopPointInfo } from '../types/tfl';

/**
 * Route definitions based on the requirements
 */

// Helper function to create stop points from the provided data
const createStopPoints = (stopData: string[]): StopPointInfo[] => {
  return stopData.map((stop, index) => {
    const [id, name] = stop.split(':');
    return { id, name, order: index + 1 };
  });
};

// Route 1: Kingfisher Way to Liverpool Street via Wembley Park
const route1Outbound: RouteDefinition = {
  id: 'route1-outbound',
  name: 'Route 1 Outbound',
  description: 'Kingfisher Way → Liverpool Street via Wembley Park',
  segments: [
    {
      id: 'route1-out-bus206',
      lineId: '206',
      lineName: 'Bus 206',
      mode: 'bus',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '490G00008746:Kingfisher Way',
        '490G00008463:IKEA Brent Park/Drury Way',
        '490G00004297:Brent Park Tesco',
        '490G00007753:Hannah Close',
        '490G00013614:Third Way',
        '490G00006858:First Way',
        '490G00010593:Olympic Way',
        '490G00011818:Rutherford Way',
        '490G00007063:Fulton Road',
        '490G00006565:Empire Way',
        '490000257M:Wembley Park Station'
      ])
    },
    {
      id: 'route1-out-metropolitan',
      lineId: 'metropolitan',
      lineName: 'Metropolitan Line',
      mode: 'tube',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '940GZZLUWYP:Wembley Park',
        '940GZZLUFYR:Finchley Road',
        '940GZZLUBST:Baker Street',
        '940GZZLUGPS:Great Portland Street',
        '940GZZLUESQ:Euston Square',
        '940GZZLUKSX:King\'s Cross St. Pancras',
        '940GZZLUFCN:Farringdon',
        '940GZZLUBBN:Barbican',
        '940GZZLUMGT:Moorgate',
        '940GZZLULVT:Liverpool Street'
      ])
    }
  ]
};

const route1Inbound: RouteDefinition = {
  id: 'route1-inbound',
  name: 'Route 1 Inbound',
  description: 'Liverpool Street → Kingfisher Way via Wembley Park',
  segments: [
    {
      id: 'route1-in-metropolitan',
      lineId: 'metropolitan',
      lineName: 'Metropolitan Line',
      mode: 'tube',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '940GZZLULVT:Liverpool Street',
        '940GZZLUMGT:Moorgate',
        '940GZZLUBBN:Barbican',
        '940GZZLUFCN:Farringdon',
        '940GZZLUKSX:King\'s Cross St. Pancras',
        '940GZZLUESQ:Euston Square',
        '940GZZLUGPS:Great Portland Street',
        '940GZZLUBST:Baker Street',
        '940GZZLUFYR:Finchley Road',
        '940GZZLUWYP:Wembley Park'
      ])
    },
    {
      id: 'route1-in-bus206',
      lineId: '206',
      lineName: 'Bus 206',
      mode: 'bus',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '490000257O:Wembley Park Station',
        '490G00006565:Empire Way',
        '490G00007063:Fulton Road',
        '490G00011818:Rutherford Way',
        '490G00010593:Olympic Way',
        '490G00006858:First Way',
        '490G00013614:Third Way',
        '490G00007753:Hannah Close',
        '490G00004297:Brent Park Tesco',
        '490G00008456:IKEA Brent Park',
        '490G00008746:Kingfisher Way'
      ])
    }
  ]
};

// Route 2: Kingfisher Way to Liverpool Street via Harlesden
const route2Outbound: RouteDefinition = {
  id: 'route2-outbound',
  name: 'Route 2 Outbound',
  description: 'Kingfisher Way → Liverpool Street via Harlesden',
  segments: [
    {
      id: 'route2-out-bus206-224',
      lineId: '206,224',
      lineName: 'Bus 206/224',
      mode: 'bus',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '490G00008746:Kingfisher Way',
        '490G00013098:Swaminarayan Temple',
        '490G00012018:Gloucester Close',
        '490G00006769:Fawood Avenue',
        '490G00008865:Knatchbull Road',
        '490G00014798:Winchelsea Road/Harlesden Station',
        '490000100S:Harlesden Station'
      ])
    },
    {
      id: 'route2-out-bakerloo',
      lineId: 'bakerloo',
      lineName: 'Bakerloo Line',
      mode: 'tube',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '940GZZLUHSN:Harlesden',
        '940GZZLUWJN:Willesden Junction',
        '940GZZLUKSL:Kensal Green',
        '940GZZLUQPS:Queen\'s Park',
        '940GZZLUKPK:Kilburn Park',
        '940GZZLUMVL:Maida Vale',
        '940GZZLUWKA:Warwick Avenue',
        '940GZZLUPAC:Paddington',
        '940GZZLUERB:Edgware Road (Bakerloo Line)',
        '940GZZLUMYB:Marylebone',
        '940GZZLUBST:Baker Street'
      ])
    },
    {
      id: 'route2-out-hammersmith-circle',
      lineId: 'hammersmith-city,circle',
      lineName: 'Hammersmith & City/Circle Line',
      mode: 'tube',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '940GZZLUBST:Baker Street',
        '940GZZLUGPS:Great Portland Street',
        '940GZZLUESQ:Euston Square',
        '940GZZLUKSX:King\'s Cross St. Pancras',
        '940GZZLUFCN:Farringdon',
        '940GZZLUBBN:Barbican',
        '940GZZLUMGT:Moorgate',
        '940GZZLULVT:Liverpool Street'
      ])
    }
  ]
};

const route2Inbound: RouteDefinition = {
  id: 'route2-inbound',
  name: 'Route 2 Inbound',
  description: 'Liverpool Street → Kingfisher Way via Harlesden',
  segments: [
    {
      id: 'route2-in-hammersmith-circle',
      lineId: 'hammersmith-city,circle',
      lineName: 'Hammersmith & City/Circle Line',
      mode: 'tube',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '940GZZLULVT:Liverpool Street',
        '940GZZLUMGT:Moorgate',
        '940GZZLUBBN:Barbican',
        '940GZZLUFCN:Farringdon',
        '940GZZLUKSX:King\'s Cross St. Pancras',
        '940GZZLUESQ:Euston Square',
        '940GZZLUGPS:Great Portland Street',
        '940GZZLUBST:Baker Street'
      ])
    },
    {
      id: 'route2-in-bakerloo',
      lineId: 'bakerloo',
      lineName: 'Bakerloo Line',
      mode: 'tube',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '940GZZLUBST:Baker Street',
        '940GZZLUMYB:Marylebone',
        '940GZZLUERB:Edgware Road (Bakerloo Line)',
        '940GZZLUPAC:Paddington',
        '940GZZLUWKA:Warwick Avenue',
        '940GZZLUMVL:Maida Vale',
        '940GZZLUKPK:Kilburn Park',
        '940GZZLUQPS:Queen\'s Park',
        '940GZZLUKSL:Kensal Green',
        '940GZZLUWJN:Willesden Junction',
        '940GZZLUHSN:Harlesden'
      ])
    },
    {
      id: 'route2-in-bus206-224',
      lineId: '206,224',
      lineName: 'Bus 206/224',
      mode: 'bus',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '490000100N:Harlesden Station',
        '490G00014798:Winchelsea Road/Harlesden Station',
        '490G00008865:Knatchbull Road',
        '490G00006769:Fawood Avenue',
        '490G00012018:Gloucester Close',
        '490G00013098:Swaminarayan Temple',
        '490G00008746:Kingfisher Way'
      ])
    }
  ]
};

// Route 3: Normansmead to Liverpool Street via Ealing Broadway
const route3Outbound: RouteDefinition = {
  id: 'route3-outbound',
  name: 'Route 3 Outbound',
  description: 'Normansmead → Liverpool Street via Ealing Broadway',
  segments: [
    {
      id: 'route3-out-bus112',
      lineId: '112',
      lineName: 'Bus 112',
      mode: 'bus',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '490G00010313:Normansmead',
        '490G00005538:Conduit Way',
        '490G00007855:Harrow Road',
        '490G00010347:Point Place',
        '490000224A:Stonebridge Park Station',
        '490G00003914:Beresford Avenue',
        '490G00003029:Abbey Road',
        '490G00008521:Iveagh Avenue',
        '490G00007696:Brentmead Gardens',
        '490G00010751:Park Avenue',
        '490000099J:Hanger Lane Station',
        '490G000904:Ashbourne Road',
        '490G00008210:Hillcrest Road',
        '490G00003477:Audley Road',
        '490000158A:North Ealing Station',
        '490G000376:Westbury Road',
        '490G000578:Haven Grn/Ealing Broadway Station'
      ])
    },
    {
      id: 'route3-out-elizabeth',
      lineId: 'elizabeth',
      lineName: 'Elizabeth Line',
      mode: 'rail',
      direction: 'outbound',
      stopPoints: createStopPoints([
        '910GEALINGB:Ealing Broadway',
        '910GACTONML:Acton Main Line',
        '910GPADTLL:Paddington',
        '910GBONDST:Bond Street',
        '910GTOTCTRD:Tottenham Court Road',
        '910GFRNDXR:Farringdon',
        '910GLIVSTLL:Liverpool Street'
      ])
    }
  ]
};

const route3Inbound: RouteDefinition = {
  id: 'route3-inbound',
  name: 'Route 3 Inbound',
  description: 'Liverpool Street → Wrights Place via Ealing Broadway',
  segments: [
    {
      id: 'route3-in-elizabeth',
      lineId: 'elizabeth',
      lineName: 'Elizabeth Line',
      mode: 'rail',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '910GLIVSTLL:Liverpool Street',
        '910GFRNDXR:Farringdon',
        '910GTOTCTRD:Tottenham Court Road',
        '910GBONDST:Bond Street',
        '910GPADTLL:Paddington',
        '910GACTONML:Acton Main Line',
        '910GEALINGB:Ealing Broadway'
      ])
    },
    {
      id: 'route3-in-bus112',
      lineId: '112',
      lineName: 'Bus 112',
      mode: 'bus',
      direction: 'inbound',
      stopPoints: createStopPoints([
        '490G000578:Haven Grn/Ealing Broadway Station',
        '490G000376:Westbury Road',
        '490G000377:Hanger Lane',
        '490G00008210:Hillcrest Road',
        '490000099A:Hanger Lane Station',
        '490G000568:Hanger Lane Gyratory',
        '490G00010751:Park Avenue',
        '490G00007696:Brentmead Gardens',
        '490G00008521:Iveagh Avenue',
        '490G00003029:Abbey Road',
        '490G00003914:Beresford Avenue',
        '490000224B:Stonebridge Park Station',
        '490G00010347:Point Place',
        '490G00007855:Harrow Road',
        '490G00005538:Conduit Way',
        '490G00014960:Wrights Place'
      ])
    }
  ]
};

export const ALL_ROUTES: RouteDefinition[] = [
  route1Outbound,
  route1Inbound,
  route2Outbound,
  route2Inbound,
  route3Outbound,
  route3Inbound
];

export const ALL_LINE_IDS = [
  'metropolitan',
  'hammersmith-city',
  'circle',
  'bakerloo',
  'elizabeth',
  '112',
  '206',
  '224'
];

// Extract all unique stop point IDs from routes
export const getAllStopPointIds = (): string[] => {
  const stopIds = new Set<string>();
  
  ALL_ROUTES.forEach(route => {
    route.segments.forEach(segment => {
      segment.stopPoints.forEach(stop => {
        stopIds.add(stop.id);
      });
    });
  });
  
  return Array.from(stopIds);
};