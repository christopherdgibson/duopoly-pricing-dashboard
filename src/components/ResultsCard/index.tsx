import type { BenchmarkProps, FinalAverageProps, SimulationResults } from '../../types';
import styles from './ResultsCard.module.css';

interface CardProps {
    title?: string;
}

interface SimulationCardProps extends CardProps {
    final_averages: FinalAverageProps;
}

interface BenchmarkCardProps extends CardProps {
    benchmarks: BenchmarkProps;
}

export function BenchmarkResultsCard({title="Benchmark Results", benchmarks}: BenchmarkCardProps) {
  if (!benchmarks) return null;

    return (
        <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>{title}</h3>
            <div className={styles.resultsGrid}>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Marginal Cost</span>
                    <span className={styles.metricValue}>
                        €{benchmarks.marginal_cost}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Bertrand Price</span>
                    <span className={styles.metricValue}>
                        €{benchmarks.bertrand_price}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Monopoly Price</span>
                    <span className={styles.metricValue}>
                        €{benchmarks.monopoly_price}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function SimulationResultsCard({ title="Simulation Results", final_averages }: SimulationCardProps) {
    if (!final_averages) return null;

    return (
        <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>{title}</h3>
            <div className={styles.resultsGrid}>
            <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Learned Price</span>
                <span className={styles.metricValue}>
                    €{final_averages.final_avg_joint_price}
                </span>
            </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Price 1</span>
                    <span className={styles.metricValue}>
                        €{final_averages.final_avg_p1}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Price 2</span>
                    <span className={styles.metricValue}>
                        €{final_averages.final_avg_p2}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Profit 1</span>
                    <span className={styles.metricValue}>
                        €{final_averages.final_avg_profit1}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Profit 2</span>
                    <span className={styles.metricValue}>
                        €{final_averages.final_avg_profit2}
                    </span>
                </div>
            </div>
        </div>
    );
}
