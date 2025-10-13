import React, { useState, useEffect } from 'react';
import { RouteDisruptions } from './types/tfl';
import { RouteDisruptionService } from './services/routeDisruptionService';
import RouteCard from './components/RouteCard';
import './App.css';

interface AppState {
  routeDisruptions: RouteDisruptions[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  expandedRoutes: Set<string>;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    routeDisruptions: [],
    loading: true,
    error: null,
    lastUpdated: null,
    expandedRoutes: new Set()
  });

  const routeService = new RouteDisruptionService();

  const fetchDisruptions = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const disruptions = await routeService.getAllRouteDisruptions();
      setState(prev => ({
        ...prev,
        routeDisruptions: disruptions,
        loading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch disruptions'
      }));
    }
  };

  useEffect(() => {
    fetchDisruptions();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchDisruptions, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleExpand = (routeId: string) => {
    setState(prev => {
      const newExpandedRoutes = new Set(prev.expandedRoutes);
      if (newExpandedRoutes.has(routeId)) {
        newExpandedRoutes.delete(routeId);
      } else {
        newExpandedRoutes.add(routeId);
      }
      return { ...prev, expandedRoutes: newExpandedRoutes };
    });
  };

  const handleRefresh = () => {
    fetchDisruptions();
  };

  const handleExpandAll = () => {
    setState(prev => ({
      ...prev,
      expandedRoutes: new Set(prev.routeDisruptions.map(rd => rd.route.id))
    }));
  };

  const handleCollapseAll = () => {
    setState(prev => ({
      ...prev,
      expandedRoutes: new Set()
    }));
  };

  const { outbound, inbound } = routeService.getRoutesByDirection();
  
  const getRouteDisruptions = (routeId: string) => 
    state.routeDisruptions.find(rd => rd.route.id === routeId);

  const getOverallStatus = () => {
    if (state.routeDisruptions.length === 0) return 'unknown';
    
    const statuses = state.routeDisruptions.map(rd => rd.overallStatus);
    
    if (statuses.includes('severe')) return 'severe';
    if (statuses.includes('major')) return 'major';
    if (statuses.includes('minor')) return 'minor';
    return 'good';
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'severe': return '🔴';
      case 'major': return '🟠';
      case 'minor': return '🟡';
      case 'good': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="app-title">
              {getStatusEmoji(getOverallStatus())} TfL Disruption Monitor
            </h1>
            <p className="app-subtitle">
              Real-time disruption information for key London transport routes
            </p>
          </div>
          
          <div className="header-actions">
            <button 
              className="action-btn refresh-btn" 
              onClick={handleRefresh}
              disabled={state.loading}
            >
              {state.loading ? '⟳' : '🔄'} Refresh
            </button>
            
            <button 
              className="action-btn expand-btn" 
              onClick={handleExpandAll}
            >
              ⬇ Expand All
            </button>
            
            <button 
              className="action-btn collapse-btn" 
              onClick={handleCollapseAll}
            >
              ⬆ Collapse All
            </button>
          </div>
        </div>
        
        {state.lastUpdated && (
          <div className="last-updated">
            Last updated: {formatLastUpdated(state.lastUpdated)}
          </div>
        )}
      </header>

      <main className="app-main">
        {state.loading && state.routeDisruptions.length === 0 && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading disruption information...</p>
          </div>
        )}

        {state.error && (
          <div className="error-container">
            <h3>⚠ Error Loading Data</h3>
            <p>{state.error}</p>
            <button className="retry-btn" onClick={handleRefresh}>
              Retry
            </button>
          </div>
        )}

        {!state.loading && !state.error && state.routeDisruptions.length === 0 && (
          <div className="no-data-container">
            <h3>No Data Available</h3>
            <p>Unable to load route disruption information.</p>
            <button className="retry-btn" onClick={handleRefresh}>
              Retry
            </button>
          </div>
        )}

        {state.routeDisruptions.length > 0 && (
          <div className="routes-container">
            <section className="routes-section">
              <h2 className="section-title">Outbound Routes</h2>
              <div className="routes-list">
                {outbound.map(route => {
                  const disruptions = getRouteDisruptions(route.id);
                  return disruptions ? (
                    <RouteCard
                      key={route.id}
                      routeDisruptions={disruptions}
                      isExpanded={state.expandedRoutes.has(route.id)}
                      onToggleExpand={() => handleToggleExpand(route.id)}
                    />
                  ) : null;
                })}
              </div>
            </section>

            <section className="routes-section">
              <h2 className="section-title">Inbound Routes</h2>
              <div className="routes-list">
                {inbound.map(route => {
                  const disruptions = getRouteDisruptions(route.id);
                  return disruptions ? (
                    <RouteCard
                      key={route.id}
                      routeDisruptions={disruptions}
                      isExpanded={state.expandedRoutes.has(route.id)}
                      onToggleExpand={() => handleToggleExpand(route.id)}
                    />
                  ) : null;
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data provided by Transport for London (TfL). 
          <a 
            href="https://api-portal.tfl.gov.uk/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            TfL API Portal
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;