import { useMemo } from 'react';
import type { FirmBenchmarkResults, FinalAverageProps } from '../../types';
import { formatCurrencyValues } from '../../utils/currencyUtils';
import styles from '../../App/App.module.css';

interface CardProps {
    title?: string;
}

interface SimulationCardProps extends CardProps {
    final_averages: FinalAverageProps;
}

interface BenchmarkCardProps extends CardProps {
    benchmarks: Array<FirmBenchmarkResults>;
}

interface FirmBenchmarkCardProps {
    benchmarks: FirmBenchmarkResults | null;
    showTitle?: boolean;
    collapseCard?: boolean;
}

export function BenchmarkResultsCard({title="Benchmark Results", benchmarks}: BenchmarkCardProps) {
    if (!benchmarks || benchmarks.length === 0) return null;
    
    const benchmarksAsymmetric = benchmarks.length > 1;
    return (
        <div className={styles.resultsCard}>
            <h3 className={styles.resultsTitle}>{title}</h3>
            <FirmBenchmarksCard benchmarks={benchmarks[0]} showTitle={benchmarksAsymmetric} />
            <FirmBenchmarksCard benchmarks={benchmarks[1]} showTitle={benchmarksAsymmetric} collapseCard={!benchmarksAsymmetric}/>
        </div>
    );
}

function FirmBenchmarksCard({benchmarks, showTitle = false, collapseCard = false}: FirmBenchmarkCardProps) {
    const benchmarksNull = {
        marginal_cost: '-',
        bertrand_price: '-',
        monopoly_price: '-'
    }
    const title = benchmarks ? `Firm ${benchmarks.firm}` : 'Firm 2';

    const formattedBenchmarks = useMemo(
        () => benchmarks ? formatCurrencyValues(benchmarks, [
            'firm',
        ]) : benchmarksNull,
        [benchmarks]
    );
        
    return (
        <div className={styles.resultsRow} style={{maxHeight: collapseCard ? 0 : 100}}>
            <div className={styles.rowLabel} style={{opacity: showTitle ? 1 : 0}}>
                {title}
            </div>
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
            <div className={styles.rowLabel}>
                {title}
            </div>
        </div>
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
