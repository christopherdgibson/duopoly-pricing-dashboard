import { useMemo } from 'react';
import type { FirmBenchmarkResults, FinalAverageProps } from '../../types';
import { formatCurrencyValues } from '../../utilities';
import styles from './ResultsCard.module.css';

interface CardProps {
    title?: string;
}

interface SimulationCardProps extends CardProps {
    final_averages: FinalAverageProps;
}

interface BenchmarkCardProps extends CardProps {
    benchmarks: Array<FirmBenchmarkResults>;
}

interface FirmBenchmarkCardProps extends CardProps {
    benchmarks: FirmBenchmarkResults;
}

export function BenchmarkResultsCard({title="Benchmark Results", benchmarks}: BenchmarkCardProps) {
  if (!benchmarks || benchmarks.length === 0) return null;

    return (
        <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>{title}</h3>
            {benchmarks.length === 1 ?
                (
                    <FirmBenchmarksCard benchmarks={benchmarks[0]} />
                ) : (
                    <>
                        <FirmBenchmarksCard title={"Firm 1"} benchmarks={benchmarks[0]} />
                        <FirmBenchmarksCard title={"Firm 2"} benchmarks={benchmarks[1]} />
                    </>
                )
            }
        </div>
    );
}

function FirmBenchmarksCard({title, benchmarks}: FirmBenchmarkCardProps) {
    const formattedBenchmarks = useMemo(
        () => formatCurrencyValues(benchmarks, [
            'firm',
        ]),
        [benchmarks]
    );
        
    return (
        <>
            {title && <h3 className={styles.resultsSubTitle}>{title}</h3>}
            <div className={styles.resultsGrid}>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Marginal Cost</span>
                    <span className={styles.metricValue}>
                        {formattedBenchmarks.marginal_cost}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Bertrand Price</span>
                    <span className={styles.metricValue}>
                        {formattedBenchmarks.bertrand_price}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Monopoly Price</span>
                    <span className={styles.metricValue}>
                        {formattedBenchmarks.monopoly_price}
                    </span>
                </div>
            </div>
        </>
    );
}

export function SimulationResultsCard({ title="Simulation Results", final_averages }: SimulationCardProps) {
    if (!final_averages) return null;

    const formattedAverages = useMemo(
        () => formatCurrencyValues(final_averages, [
            'final_streak1',
            'final_streak2',
            'episodes_to_converge',
        ]),
        [final_averages]
    );

    return (
        <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>{title}</h3>
            <div className={styles.resultsGrid}>
            <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Learned Price</span>
                <span className={styles.metricValue}>
                    {formattedAverages.final_avg_joint_price}
                </span>
            </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Price 1</span>
                    <span className={styles.metricValue}>
                        {formattedAverages.final_avg_p1}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Price 2</span>
                    <span className={styles.metricValue}>
                        {formattedAverages.final_avg_p2}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Profit 1</span>
                    <span className={styles.metricValue}>
                        {formattedAverages.final_avg_profit1}
                    </span>
                </div>
                <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Final Average Profit 2</span>
                    <span className={styles.metricValue}>
                        {formattedAverages.final_avg_profit2}
                    </span>
                </div>
                {final_averages.episodes_to_converge && (
                    <>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Final Streak 1</span>
                            <span className={styles.metricValue}>
                                {formattedAverages.final_streak1}
                            </span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Final Streak 2</span>
                            <span className={styles.metricValue}>
                                {formattedAverages.final_streak2}
                            </span>
                        </div>
                        <div className={styles.metricItem}>
                            <span className={styles.metricLabel}>Episodes to Converge</span>
                            <span className={styles.metricValue}>
                                {formattedAverages.episodes_to_converge}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
