// 骨架屏组件
'use client';

import styles from './Skeleton.module.css';

export default function SkeletonScreen() {
  return (
    <div className={styles.skeletonScreen}>
      {/* 骨架屏顶部 */}
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonHeaderLeft}>
          <div className={styles.skeletonBlock} style={{ width: 120, height: 16 }} />
          <div className={styles.skeletonBlock} style={{ width: 80, height: 16 }} />
          <div className={styles.skeletonBlock} style={{ width: 100, height: 16 }} />
        </div>
        <div className={styles.skeletonHeaderRight}>
          <div className={styles.skeletonBlock} style={{ width: 100, height: 32 }} />
          <div className={styles.skeletonBlock} style={{ width: 80, height: 32 }} />
        </div>
      </div>

      {/* 骨架屏主体 */}
      <div className={styles.skeletonMain}>
        {/* 左侧导航 */}
        <div className={styles.skeletonLeftNav}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`${styles.skeletonBlock} ${styles.skeletonNavItem}`} />
          ))}
          <div className={styles.skeletonNavSpacer}>
            <div className={styles.skeletonBlock} style={{ width: 60, height: 12, marginBottom: 8 }} />
            <div className={styles.skeletonBlock} style={{ width: 80, height: 16 }} />
          </div>
          <div className={styles.skeletonNavSpacer}>
            <div className={styles.skeletonBlock} style={{ width: 100, height: 16 }} />
          </div>
        </div>

        {/* 中间内容 */}
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonContentInner}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonCard}`} />
            <div className={styles.skeletonCardRow}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonHalfCard}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonHalfCard}`} />
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className={styles.skeletonRightPanel}>
          <div className={styles.skeletonRightContent}>
            <div className={styles.skeletonBlock} style={{ width: 120, height: 20, marginBottom: 8 }} />
            <div className={styles.skeletonBlock} style={{ width: 60, height: 14, marginBottom: 20 }} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonSuggestion}`} />
            <div className={styles.skeletonRightSpacer}>
              <div className={styles.skeletonBlock} style={{ width: '100%', height: 32, marginBottom: 8 }} />
              <div className={styles.skeletonBlock} style={{ width: '100%', height: 32, marginBottom: 16 }} />
              <div className={styles.skeletonBlock} style={{ width: '100%', height: 80 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
