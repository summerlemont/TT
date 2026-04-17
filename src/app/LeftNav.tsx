// 左侧导航栏组件
'use client';

import styles from './LeftNav.module.css';
import type { DimensionId, DimensionScore } from './types';

interface Dimension {
  id: DimensionId;
  name: string;
  maxScore: number;
}

interface LeftNavProps {
  dimensions: readonly Dimension[];
  activeDimension: DimensionId;
  scores: Record<DimensionId, DimensionScore>;
  redcardPassed: boolean;
  suspectedItems: string[];
  totalScore: number;
  onDimensionChange: (dimensionId: DimensionId) => void;
}

export default function LeftNav({
  dimensions,
  activeDimension,
  scores,
  redcardPassed,
  suspectedItems,
  totalScore,
  onDimensionChange,
}: LeftNavProps) {
  const getIconClass = (dimensionId: DimensionId) => {
    const score = scores[dimensionId];
    if (score.status === 'pending') return styles.iconPending;
    if (score.status === 'auto_filled') return styles.iconAutoFilled;
    if (score.score === 5) return styles.iconConfirmedPerfect;
    if (score.errorTags.some(tag => tag.includes('底线') || tag.includes('红牌'))) return styles.iconConfirmedRedFlag;
    return styles.iconConfirmedWithDeduction;
  };

  const getIconContent = (dimensionId: DimensionId) => {
    const score = scores[dimensionId];
    if (score.status === 'pending') return '○';
    if (score.status === 'auto_filled') return '◐';
    if (score.score === 5) return '✓';
    if (score.errorTags.some(tag => tag.includes('底线') || tag.includes('红牌'))) return '✕';
    return '✓';
  };

  return (
    <aside className={styles.leftNav}>
      {/* 维度导航列表 */}
      <div className={styles.dimensionList}>
        {dimensions.map((dimension) => (
          <div
            key={dimension.id}
            className={`${styles.dimensionItem} ${activeDimension === dimension.id ? styles.dimensionItemActive : ''}`}
            onClick={() => onDimensionChange(dimension.id)}
          >
            <span className={`${styles.dimensionIcon} ${getIconClass(dimension.id)}`}>
              {getIconContent(dimension.id)}
            </span>
            <span className={styles.dimensionName}>{dimension.name}</span>
            {scores[dimension.id].status === 'confirmed' && (
              <span className={styles.dimensionScore}>
                {scores[dimension.id].score}分
              </span>
            )}
          </div>
        ))}
      </div>

      {/* 红牌预检区 */}
      <div className={styles.redcardPrecheck}>
        <div className={styles.redcardTitle}>红牌预检</div>
        <div className={`${styles.redcardResult} ${redcardPassed ? styles.redcardPassed : styles.redcardFailed}`}>
          {redcardPassed ? (
            <>
              <span className={styles.redcardIcon}>✓</span>
              <span>全部通过</span>
            </>
          ) : (
            <>
              <span className={styles.redcardIcon}>✕</span>
              <span>发现 {suspectedItems.length} 项疑似底线</span>
            </>
          )}
        </div>
        {!redcardPassed && suspectedItems.length > 0 && (
          <div className={styles.redcardExpand}>
            {suspectedItems.map((item, i) => (
              <div key={i} className={styles.suspectedItem}>• {item}</div>
            ))}
          </div>
        )}
      </div>

      {/* 底部总分 */}
      <div className={styles.totalScore}>
        当前总分：<span className={styles.totalScoreValue}>{totalScore}</span> / 30
      </div>
    </aside>
  );
}
