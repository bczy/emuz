/**
 * UI Components tests
 */

import { describe, it, expect } from 'vitest';
import * as Components from '../components';

describe('Component Exports', () => {
  it('should export Button component', () => {
    expect(Components.Button).toBeDefined();
  });

  it('should export Input component', () => {
    expect(Components.Input).toBeDefined();
  });

  it('should export Card component', () => {
    expect(Components.Card).toBeDefined();
  });

  it('should export GameCard component', () => {
    expect(Components.GameCard).toBeDefined();
  });

  it('should export GameGrid component', () => {
    expect(Components.GameGrid).toBeDefined();
  });

  it('should export PlatformCard component', () => {
    expect(Components.PlatformCard).toBeDefined();
  });

  it('should export SearchBar component', () => {
    expect(Components.SearchBar).toBeDefined();
  });

  it('should export Sidebar component', () => {
    expect(Components.Sidebar).toBeDefined();
  });
});

describe('Component Structure', () => {
  it('should have all components as functions or classes', () => {
    const componentKeys = Object.keys(Components);
    
    componentKeys.forEach((key) => {
      const component = Components[key as keyof typeof Components];
      const type = typeof component;
      
      // Components should be functions (functional components) or objects (with exports)
      expect(['function', 'object']).toContain(type);
    });
  });
});
