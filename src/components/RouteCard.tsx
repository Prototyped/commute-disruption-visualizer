import React, { useState } from 'react';
import { RouteDisruptions } from '../types/tfl';
import GroupedDisruptionCard from './GroupedDisruptionCard';
import RouteSegmentDisplay from './RouteSegmentDisplay';
import './RouteCard.css';

interface RouteCardProps {
  routeDisruptions: RouteDisruptions;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ 
  routeDisruptions, 
  isExpanded = false,
  onToggleExpand 
}) => {
  const [showInactiveDisruptions, setShowInactiveDisruptions] = useState(false);

  const { route, lineDisruptions, stopDisruptions, groupedDisruptions } = routeDisruptions;

  // Use grouped disruptions as the primary display method
  const activeGroupedDisruptions = groupedDisruptions.filter(d => d.isActive);
  const inactiveGroupedDisruptions = groupedDisruptions.filter(d => !d.isActive);

  const disruptionsToShow = showInactiveDisruptions ? groupedDisruptions : activeGroupedDisruptions;

  return (
    <div className={"route-card"}>
      <div className="route-header" onClick={onToggleExpand}>
        <div className="route-info">
          <h3 className="route-name">{route.name}</h3>
          <p className="route-description">{route.description}</p>
        </div>
        
        <div className="route-status">
          {activeGroupedDisruptions.length > 0 && (
            <span className="disruption-count">
              {activeGroupedDisruptions.length} active disruption{activeGroupedDisruptions.length !== 1 ? 's' : ''}
            </span>
          )}
          
          {inactiveGroupedDisruptions.length > 0 && (
            <span className="disruption-count inactive">
              {inactiveGroupedDisruptions.length} resolved
            </span>
          )}
        </div>
        
        <div className="route-expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="route-details">
          <RouteSegmentDisplay route={route} />
          
          {groupedDisruptions.length > 0 ? (
            <div className="route-disruptions">
              <div className="disruptions-header">
                <h4>Disruptions</h4>
                
                {inactiveGroupedDisruptions.length > 0 && (
                  <button
                    className="toggle-inactive-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInactiveDisruptions(!showInactiveDisruptions);
                    }}
                  >
                    {showInactiveDisruptions ? 'Hide' : 'Show'} resolved ({inactiveGroupedDisruptions.length})
                  </button>
                )}
              </div>
              
              <div className="disruptions-list">
                {disruptionsToShow.length > 0 ? (
                  disruptionsToShow.map(disruption => (
                    <GroupedDisruptionCard
                      key={disruption.id}
                      disruption={disruption}
                    />
                  ))
                ) : (
                  <p className="no-disruptions">No active disruptions</p>
                )}
              </div>
            </div>
          ) : (
            <div className="route-disruptions">
              <p className="no-disruptions">No disruptions reported</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteCard;