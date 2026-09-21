import React from 'react';
import Slider from 'react-input-slider';
import styles from './Controls.module.css';
import type { MarketConfig } from '../../types';

interface ControlsProps {
  config: MarketConfig;
  onChange: (updatedParams: MarketConfig) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  config,
  onChange,
  onRunSimulation,
  isRunning,
}) => {
  const handleInputChange = (field: keyof MarketConfig, value: number) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  return (
    <div className={styles.controlsCard}>
      <div className={styles.header}>
        <h2 className={styles.title}>Model Parameters</h2>
        <span className={styles.badge}>Q-Learning Duopoly</span>
      </div>
      <h3 className={styles.subTitle}>Demand Parameters</h3>
      <div className={styles.grid}>
        {/* Demand Intercept */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Demand Intercept (<em>a</em>)</span>
            <span className={styles.hint}>Market size</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.demandIntercept}
            disabled={isRunning}
            onChange={(e) => handleInputChange('demandIntercept', Number(e.target.value))}
          />
        </div>

        {/* Demand Slope */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Demand Slope (<em>b</em>)</span>
            <span className={styles.hint}>Price sensitivity</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.demandSlope}
            disabled={isRunning}
            onChange={(e) => handleInputChange('demandSlope', Number(e.target.value))}
          />
        </div>

        {/* Marginal Cost */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Marginal Cost (<em>c</em>)</span>
            <span className={styles.hint}>Unit cost</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.marginalCost}
            disabled={isRunning}
            onChange={(e) => handleInputChange('marginalCost', Number(e.target.value))}
          />
        </div>
      </div>

      <h3 className={styles.subTitle}>Learning Parameters</h3>
      <div className={styles.grid}>
        {/* Learning Rate (Alpha) */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Learning Rate (<em>&alpha;</em>)</span>
            <span className={styles.hint}>0.01 - 1.0</span>
          </label>
          <div className={styles.slider}>
            <div className={styles.sliderValue}>
              <input
                type="number"
                className={styles.input}
                value={config.alpha}
                disabled={isRunning}
                min={0.01}
                max={1.0}
                step={0.01}
                onChange={(e) => handleInputChange('alpha', Number(e.target.value))}
              />
            </div>
            <Slider
              axis="x"
              x={config.alpha}
              disabled={isRunning}
              xmin={0.01}
              xmax={1.0}
              xstep={0.01}
              onChange={(e) => handleInputChange('alpha', Number(e.x.toFixed(2)))}/>
          </div>
        </div>

        {/* Epsilon */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Exploration (<em>&epsilon;</em>)</span>
            <span className={styles.hint}>Initial rate</span>
          </label>
          <div className={styles.slider}>
            <div className={styles.sliderValue}>
              <input
                type="number"
                className={styles.input}
                value={config.epsilon}
                disabled={isRunning}
                min={0.0}
                max={1.0}
                step={0.05}
                onChange={(e) => handleInputChange('epsilon', Number(e.target.value))}
              />
            </div>
            <Slider
              axis="x"
              x={config.epsilon}
              disabled={isRunning}
              xmin={0.0}
              xmax={1.0}
              xstep={0.05}
              onChange={(e) => handleInputChange('epsilon', Number(e.x.toFixed(2)))}/>
          </div>
        </div>
      </div>

      <h3 className={styles.subTitle}>Simulation Parameters</h3>
      <div className={styles.grid}>
        {/* Episodes */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Episodes</span>
            <span className={styles.hint}>Total iterations</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.episodes}
            disabled={isRunning}
            min={100}
            max={50000}
            step={100}
            onChange={(e) => handleInputChange('episodes', Number(e.target.value))}
          />
        </div>

        {/* Window Size */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            <span>Window Size</span>
            <span className={styles.hint}>Number iterations per group</span>
          </label>
          <input
            type="number"
            className={styles.input}
            value={config.windowSize}
            disabled={isRunning}
            min={1}
            max={50000}
            step={1}
            onChange={(e) => handleInputChange('windowSize', Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.primaryButton}
          onClick={onRunSimulation}
          disabled={isRunning}
        >
          {isRunning ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
};

export default Controls;