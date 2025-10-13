import React from 'react';
import { ProcessedDisruption } from '../types/tfl';
import './DisruptionCard.css';

interface DisruptionCardProps {
    disruption: ProcessedDisruption;
}

const DisruptionCard: React.FC<DisruptionCardProps> = ({ 
    disruption, 
}) => {
    const formatTime = (date: Date): string => {
        return date.toLocaleString();
    };

    return (
        <div className="disruption-card">
            <span className="disruption-type">{disruption.type}</span>
            <div className="disruption-header">
                <h3>{disruption.commonName || disruption.lineId || 'Unknown Location'}</h3>
            </div>
            
            <p className="disruption-description">{disruption.description}</p>
            
            <div className="disruption-details">
                <p>Mode: {disruption.mode}</p>
                <p>Active: {disruption.isActive ? 'Yes' : 'No'}</p>
                {disruption.source === 'stopPoint' && disruption.stopPointId && (
                    <p>Stop Point: {disruption.stopPointId}</p>
                )}
                {disruption.source === 'line' && disruption.lineId && (
                    <p>Line: {disruption.lineId}</p>
                )}
            </div>

            <div className="disruption-timestamps">
                <p>Start: {formatTime(disruption.startDate)}</p>
                <p>End: {formatTime(disruption.endDate)}</p>
            </div>
        </div>
    );
};

export default DisruptionCard;