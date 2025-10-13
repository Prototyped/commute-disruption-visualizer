import React from 'react';
import { RouteDefinition } from '../types/tfl';
import './RouteSegmentDisplay.css';

interface RouteSegmentDisplayProps {
  route: RouteDefinition;
  showStopDetails?: boolean;
}

const RouteSegmentDisplay: React.FC<RouteSegmentDisplayProps> = ({ 
  route, 
  showStopDetails = false 
}) => {
  const getModeIcon = (mode: string): string => {
    switch (mode) {
      case 'bus': return '🚌';
      case 'tube': return '🚇';
      case 'rail': return '🚊';
      default: return '🚌';
    }
  };

  const getModeClass = (mode: string): string => {
    switch (mode) {
      case 'bus': return 'mode-bus';
      case 'tube': return 'mode-tube';
      case 'rail': return 'mode-rail';
      default: return 'mode-bus';
    }
  };

  return (
    <div className="route-segments">
      <h4 className="segments-title">Route Segments</h4>
      
      <div className="segments-list">
        {route.segments.map((segment, index) => (
          <div key={segment.id} className="segment">
            <div className="segment-header">
              <div className={`segment-mode ${getModeClass(segment.mode)}`}>
                <span className="mode-icon">{getModeIcon(segment.mode)}</span>
                <span className="mode-name">{segment.lineName}</span>
              </div>
              
              <div className="segment-direction">
                {segment.direction === 'outbound' ? '→' : '←'}
              </div>
            </div>
            
            <div className="segment-route">
              <div className="route-stops">
                <span className="stop-name start-stop">
                  {segment.stopPoints[0]?.name || 'Unknown'}
                </span>
                
                {segment.stopPoints.length > 2 && (
                  <span className="stops-between">
                    ... {segment.stopPoints.length - 2} stops ...
                  </span>
                )}
                
                <span className="stop-name end-stop">
                  {segment.stopPoints[segment.stopPoints.length - 1]?.name || 'Unknown'}
                </span>
              </div>
            </div>
            
            {showStopDetails && (
              <div className="segment-stops-detail">
                <details>
                  <summary>View all stops ({segment.stopPoints.length})</summary>
                  <div className="stops-list">
                    {segment.stopPoints.map((stop, stopIndex) => (
                      <div key={stop.id} className="stop-detail">
                        <span className="stop-order">{stopIndex + 1}.</span>
                        <span className="stop-name">{stop.name}</span>
                        <span className="stop-id">{stop.id}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
            
            {index < route.segments.length - 1 && (
              <div className="segment-connector">
                <span className="connector-text">then</span>
                <div className="connector-line"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSegmentDisplay;