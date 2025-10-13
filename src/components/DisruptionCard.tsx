import React from 'react';
import { ProcessedDisruption } from '../types/tfl';
import './DisruptionCard.css';

interface DisruptionCardProps {
  disruption: ProcessedDisruption;
  showAffectedItems?: boolean;
}

const DisruptionCard: React.FC<DisruptionCardProps> = ({ 
  disruption, 
  showAffectedItems = true 
}) => {
  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'severe': return 'disruption-severe';
      case 'high': return 'disruption-high';
      case 'medium': return 'disruption-medium';
      case 'low': return 'disruption-low';
      default: return 'disruption-low';
    }
  };

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case 'severe': return 'Severe';
      case 'high': return 'Major';
      case 'medium': return 'Minor';
      case 'low': return 'Info';
      default: return 'Info';
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`disruption-card ${getSeverityClass(disruption.severity)} ${!disruption.isActive ? 'disruption-inactive' : ''}`}>
      <div className="disruption-header">
        <span className={`disruption-badge ${getSeverityClass(disruption.severity)}`}>
          {getSeverityLabel(disruption.severity)}
        </span>
        <span className="disruption-category">{disruption.category}</span>
        {!disruption.isActive && (
          <span className="disruption-inactive-badge">Resolved</span>
        )}
      </div>
      
      <div className="disruption-content">
        <p className="disruption-description">{disruption.description}</p>
        
        {showAffectedItems && (
          <>
            {disruption.affectedLines.length > 0 && (
              <div className="disruption-affected">
                <strong>Affected Lines:</strong>
                <div className="disruption-tags">
                  {disruption.affectedLines.map(line => (
                    <span key={line} className="disruption-tag line-tag">
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {disruption.affectedStops.length > 0 && (
              <div className="disruption-affected">
                <strong>Affected Stops:</strong>
                <div className="disruption-tags">
                  {disruption.affectedStops.slice(0, 3).map(stop => (
                    <span key={stop} className="disruption-tag stop-tag">
                      {stop}
                    </span>
                  ))}
                  {disruption.affectedStops.length > 3 && (
                    <span className="disruption-tag more-tag">
                      +{disruption.affectedStops.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="disruption-footer">
        <div className="disruption-times">
          <span className="disruption-time">
            Created: {formatTime(disruption.created)}
          </span>
          {disruption.lastUpdate.getTime() !== disruption.created.getTime() && (
            <span className="disruption-time">
              Updated: {formatTime(disruption.lastUpdate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisruptionCard;