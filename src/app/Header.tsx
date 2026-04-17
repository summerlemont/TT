// 顶部信息栏组件
'use client';

import styles from './Header.module.css';

interface CaseData {
  caseIndex: number;
  totalCases: number;
  shopId: string;
  diagnoseDate: string;
  channel: string;
  aiTarget: string;
}

interface HeaderProps {
  currentCase: CaseData;
  completedCount: number;
  totalDimensions: number;
  onSubmit: () => void;
  onSkip: () => void;
  canSubmit: boolean;
}

export default function Header({
  currentCase,
  completedCount,
  totalDimensions,
  onSubmit,
  onSkip,
  canSubmit,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.caseInfo}>
          <span className={styles.caseLabel}>Case</span>
          <span className={styles.caseIndex}>
            {currentCase.caseIndex} / {currentCase.totalCases}
          </span>
          <span className={styles.separator}>|</span>
          
          <span className={styles.caseInfoItem}>
            <span className={styles.caseLabel}>店铺ID:</span>
            <span className={styles.caseValue}>{currentCase.shopId}</span>
          </span>
          <span className={styles.separator}>|</span>
          
          <span className={styles.caseInfoItem}>
            <span className={styles.caseLabel}>诊断日期:</span>
            <span className={styles.caseValue}>{currentCase.diagnoseDate}</span>
          </span>
          <span className={styles.separator}>|</span>
          
          <span className={styles.caseInfoItem}>
            <span className={styles.caseLabel}>触达渠道:</span>
            <span className={styles.caseValue}>{currentCase.channel}</span>
          </span>
          <span className={styles.separator}>|</span>
          
          <span className={styles.caseInfoItem}>
            <span className={styles.caseLabel}>目标:</span>
            <span className={styles.caseValue}>{currentCase.aiTarget}</span>
          </span>
          <span className={styles.separator}>|</span>
          
          <span className={styles.progressIndicator}>
            <span className={styles.caseLabel}>评分进度:</span>
            <span className={styles.caseValue}>{completedCount}/{totalDimensions}</span>
            <span className={styles.progressDots}>
              {Array.from({ length: totalDimensions }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.progressDot} ${i < completedCount ? styles.progressDotCompleted : ''}`}
                />
              ))}
            </span>
          </span>
        </div>
      </div>

      <div className={styles.headerRight}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          提交标注
        </button>
        <button className={`${styles.btn} ${styles.btnText}`} onClick={onSkip}>
          跳过
        </button>
      </div>
    </header>
  );
}
