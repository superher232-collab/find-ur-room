import { useReducer, useCallback } from 'react';
import { GraphNode } from '../utils/dijkstra';

export type AppScreenState = 
  | 'landing' 
  | 'manual-position' 
  | 'destination-search' 
  | 'route-loading' 
  | 'viewing-map' 
  | 'success';

export type ErrorType = 'NODE_NOT_FOUND' | 'NO_ROUTE' | 'OFFLINE' | null;

export interface RouteResult {
  path: GraphNode[];
  totalWeight: number;
}

export interface NavigationState {
  screen: AppScreenState;
  currentNodeId: string | null;        // User's current position
  destinationNodeId: string | null;    // Selected destination
  route: RouteResult | null;           // Calculated path
  loading: boolean;                    // True during Dijkstra calculation
  error: { type: ErrorType; message: string };
  isOffline: boolean;                  // Service worker detected offline
  showOfflineBanner: boolean;          // User hasn't dismissed banner
}

type Action =
  | { type: 'SET_SCREEN'; payload: AppScreenState }
  | { type: 'SET_CURRENT_POSITION'; payload: string }
  | { type: 'SET_DESTINATION'; payload: string }
  | { type: 'SET_ROUTE_LOADING'; payload: boolean }
  | { type: 'SET_ROUTE'; payload: RouteResult | null }
  | { type: 'SET_ERROR'; payload: { type: ErrorType; message: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'DISMISS_OFFLINE_BANNER' }
  | { type: 'RESET_TO_POSITION_SELECT' }
  | { type: 'RESET_TO_LANDING' };

const initialState: NavigationState = {
  screen: 'landing',
  currentNodeId: null,
  destinationNodeId: null,
  route: null,
  loading: false,
  error: { type: null, message: '' },
  isOffline: false,
  showOfflineBanner: false,
};

function navigationReducer(state: NavigationState, action: Action): NavigationState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };
    case 'SET_CURRENT_POSITION':
      return { ...state, currentNodeId: action.payload, error: { type: null, message: '' } };
    case 'SET_DESTINATION':
      return { ...state, destinationNodeId: action.payload, error: { type: null, message: '' } };
    case 'SET_ROUTE_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ROUTE':
      return { ...state, route: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: { type: null, message: '' } };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload, showOfflineBanner: action.payload };
    case 'DISMISS_OFFLINE_BANNER':
      return { ...state, showOfflineBanner: false };
    case 'RESET_TO_POSITION_SELECT':
      return {
        ...state,
        screen: 'destination-search',
        currentNodeId: state.destinationNodeId || state.currentNodeId,
        destinationNodeId: null,
        route: null,
        loading: false,
        error: { type: null, message: '' },
      };
    case 'RESET_TO_LANDING':
      return { ...initialState, isOffline: state.isOffline, showOfflineBanner: state.showOfflineBanner };
    default:
      return state;
  }
}

export function useNavigation() {
  const [state, dispatch] = useReducer(navigationReducer, initialState);

  const setScreen = useCallback((screen: AppScreenState) => dispatch({ type: 'SET_SCREEN', payload: screen }), []);
  const setCurrentPosition = useCallback((nodeId: string) => dispatch({ type: 'SET_CURRENT_POSITION', payload: nodeId }), []);
  const setDestination = useCallback((nodeId: string) => dispatch({ type: 'SET_DESTINATION', payload: nodeId }), []);
  const setRouteLoading = useCallback((loading: boolean) => dispatch({ type: 'SET_ROUTE_LOADING', payload: loading }), []);
  const setRoute = useCallback((route: RouteResult | null) => dispatch({ type: 'SET_ROUTE', payload: route }), []);
  const setError = useCallback((type: ErrorType, message: string) => dispatch({ type: 'SET_ERROR', payload: { type, message } }), []);
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const setOffline = useCallback((isOffline: boolean) => dispatch({ type: 'SET_OFFLINE', payload: isOffline }), []);
  const dismissOfflineBanner = useCallback(() => dispatch({ type: 'DISMISS_OFFLINE_BANNER' }), []);
  const resetToPositionSelect = useCallback(() => dispatch({ type: 'RESET_TO_POSITION_SELECT' }), []);
  const resetToLanding = useCallback(() => dispatch({ type: 'RESET_TO_LANDING' }), []);

  return {
    state,
    dispatch,
    actions: {
      setScreen,
      setCurrentPosition,
      setDestination,
      setRouteLoading,
      setRoute,
      setError,
      clearError,
      setOffline,
      dismissOfflineBanner,
      resetToPositionSelect,
      resetToLanding,
    }
  };
}
