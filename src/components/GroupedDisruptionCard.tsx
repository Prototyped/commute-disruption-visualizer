import React from 'react';
import { GroupedDisruption } from '../types/tfl';
import './DisruptionCard.css';

interface GroupedDisruptionCardProps {
    disruption: GroupedDisruption;
}

const GroupedDisruptionCard: React.FC<GroupedDisruptionCardProps> = ({ 
    disruption, 
}) => {
    const formatTime = (date: Date): string => {
        return date.toLocaleString();
    };

    const formatAffectedItems = (items: string[]): string => {
        if (items.length === 0) return 'None';
        if (items.length === 1) return items[0];
        if (items.length === 2) return items.join(' and ');
        if (items.length <= 4) return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
        return items.slice(0, 3).join(', ') + ` and ${items.length - 3} more`;
    };

    return (
        <div className="disruption-card">
            <span className="disruption-type">{disruption.type}</span>
            <div className="disruption-header">
                <h3>
                    {disruption.affectedStopNames.length > 0 
                        ? formatAffectedItems(disruption.affectedStopNames)
                        : disruption.affectedLines.length > 0 
                        ? formatAffectedItems(disruption.affectedLines)
                        : 'Multiple Locations'
                    }
                </h3>
            </div>
            
            <p className="disruption-description">{disruption.description}</p>
            
            <div className="disruption-details">
                <p>Mode: {disruption.mode}</p>
                <p>Active: {disruption.isActive ? 'Yes' : 'No'}</p>
                
                {disruption.affectedLines.length > 0 && (
                    <p>Affected Lines: {formatAffectedItems(disruption.affectedLines)}</p>
                )}
                
                {disruption.affectedStopNames.length > 0 && (
                    <p>Affected Stops: {formatAffectedItems(disruption.affectedStopNames)}</p>
                )}
                
                {disruption.originalDisruptions.length > 1 && (
                    <p>Grouped from {disruption.originalDisruptions.length} disruptions</p>
                )}
            </div>

            <div className="disruption-timestamps">
                <p>Start: {formatTime(disruption.startDate)}</p>
                <p>End: {formatTime(disruption.endDate)}</p>
            </div>
        </div>
    );
};

export default GroupedDisruptionCard;