// 右侧标注操作栏组件
'use client';

import { useState, useEffect } from 'react';
import styles from './RightPanel.module.css';
import type { DimensionId, DimensionScore, AutoCheck, ErrorTag, Dimension } from './types';

// 错误标签配置
const ERROR_TAGS: Record<DimensionId, ErrorTag[]> = {
  merchant_data: [
    { title: '数据错误', score: -5, children: [
      { title: '接口传参错误', isRedFlag: true },
      { title: '召回链路失败', isRedFlag: true },
    ]},
    { title: '数据缺失', children: [
      { title: '商家画像数据缺失' },
      { title: '商家行为数据缺失' },
    ]},
  ],
  store_diagnosis: [
    { title: '诊断结论错误', score: -5, children: [
      { title: '模型幻觉', isRedFlag: true },
      { title: '因果逻辑推导错误', isRedFlag: true },
      { title: '商家卡点知识库经验错误', isRedFlag: true },
    ]},
    { title: '诊断点不全面', score: -3, children: [
      { title: '上下文丢失，遗漏关键信息' },
      { title: '诊断点颗粒度太粗' },
    ]},
    { title: '未输出诊断结果', score: -5, isRedFlag: true },
  ],
  task_diagnosis: [
    { title: '行动点推荐错误', score: -5, children: [
      { title: '模型幻觉', isRedFlag: true },
      { title: '因果逻辑推导错误', isRedFlag: true },
      { title: '行动点策略知识库经验错误' },
      { title: '业务约束规则失效' },
    ]},
    { title: '任务/行动点召回失败/未召回', score: -3, children: [
      { title: '行动点与任务信息不适配' },
      { title: '没有能完成这个任务的行动点' },
    ]},
  ],
  script_generation: [
    { title: '表达不当-底线', score: -5, children: [
      { title: '告知平台内部治理规则' },
      { title: '负面表述' },
      { title: '模型幻觉（过度承诺）', isRedFlag: true },
    ]},
    { title: '适配性与用户体验差', score: -2, children: [
      { title: '易读性低' },
      { title: '话术生硬' },
      { title: '接口未获取相关数据导致描述不当' },
      { title: '多次触达上下文割裂' },
      { title: '多次触达的差异性' },
      { title: '提及与行动点或任务无关的内容' },
    ]},
    { title: '文案吸引力不足', score: -2, children: [
      { title: '指令引导性不足' },
      { title: '收益不明确无感知' },
      { title: '同质化&模板单一' },
    ]},
  ],
  agent_card: [
    { title: '任务卡片/链接错误', score: -5, children: [
      { title: '任务链接/卡片信息错误/链接缺失', isRedFlag: true },
      { title: '图片文字内容错误、不完整或两者不一致', isRedFlag: true },
    ]},
    { title: '卡片吸引力弱', score: -2, children: [
      { title: '卡片文案/样式吸引力弱' },
    ]},
  ],
  send_timing: [
    { title: '触达时机不当', score: -5 },
    { title: '信息错误/过期', score: -5 },
    { title: '触达频次不合理', score: -3 },
  ],
};

interface RightPanelProps {
  activeDimension: DimensionId;
  dimensionName: string;
  currentScore: DimensionScore;
  onScoreConfirm: (dimensionId: DimensionId, score: number, errorTags: string[], comment: string) => void;
  onPrevDimension: () => void;
  onNextDimension: () => void;
  dimensions: readonly Dimension[];
  currentDimensionIndex: number;
  autoCheck: AutoCheck;
}

export default function RightPanel({
  activeDimension,
  dimensionName,
  currentScore,
  onScoreConfirm,
  onPrevDimension,
  onNextDimension,
  dimensions,
  currentDimensionIndex,
  autoCheck,
}: RightPanelProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [showManualAnnotation, setShowManualAnnotation] = useState(false);

  // 重置状态当维度切换时
  useEffect(() => {
    setSelectedTags([]);
    setComment('');
    setShowManualAnnotation(false);
  }, [activeDimension]);

  // 根据机标状态决定是否显示手动标注
  useEffect(() => {
    if (autoCheck.status === 'warning') {
      setShowManualAnnotation(true);
    }
  }, [autoCheck.status]);

  const handleAdoptSuggestion = () => {
    if (autoCheck.autoScore !== null) {
      onScoreConfirm(activeDimension, autoCheck.autoScore, [], '');
    }
  };

  const handleManualAnnotation = () => {
    setShowManualAnnotation(true);
  };

  const handleTagToggle = (tag: string, isRedFlag?: boolean) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleConfirm = () => {
    let finalScore = autoCheck.autoScore ?? 5;
    onScoreConfirm(activeDimension, finalScore, selectedTags, comment);
  };

  const getSuggestionClass = () => {
    if (autoCheck.status === 'pass') return styles.suggestionPass;
    if (autoCheck.status === 'warning') return styles.suggestionWarning;
    return styles.suggestionError;
  };

  const getScoreStatus = () => {
    if (autoCheck.autoScore !== null) {
      return autoCheck.autoScore;
    }
    if (autoCheck.status === 'error') return 0;
    return null;
  };

  const currentErrorTags = ERROR_TAGS[activeDimension] || [];

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>{dimensionName}</h2>
        <p className={styles.panelSubtitle}>满分 5 分</p>
      </div>

      <div className={styles.panelBody}>
        {/* 机标建议得分区 */}
        <div className={`${styles.autoSuggestion} ${getSuggestionClass()}`}>
          <div className={styles.autoScore}>
            建议得分：
            {getScoreStatus() !== null ? (
              <>
                <span className={styles.scoreValue}>{getScoreStatus()}分</span>
                {autoCheck.status === 'pass' && <span className={styles.scoreIcon}>✅</span>}
                {autoCheck.status === 'warning' && <span className={styles.scoreIcon}>⚠️</span>}
                {autoCheck.status === 'error' && <span className={styles.scoreIcon}>❌</span>}
              </>
            ) : (
              <span className={styles.scoreValue}>需人工判断</span>
            )}
          </div>
          <div className={styles.autoReason}>
            {autoCheck.status === 'pass' && '机标检测全部通过'}
            {autoCheck.status === 'warning' && `检测到 ${autoCheck.checks.filter(c => c.result !== 'pass').length} 项异常，请查看中间区详情`}
            {autoCheck.status === 'error' && `疑似底线问题：`}
          </div>
          {autoCheck.status === 'error' && (
            <div className={styles.errorItems}>
              {autoCheck.checks
                .filter(c => c.result === 'error')
                .map((c, i) => (
                  <div key={i} className={styles.errorItem}>{c.detail}</div>
                ))}
            </div>
          )}
          <div className={styles.autoActions}>
            {autoCheck.autoScore !== null && (
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleAdoptSuggestion}>
                采纳建议
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleManualAnnotation}>
              手动标注
            </button>
          </div>
        </div>

        {/* 手动标注区 */}
        {showManualAnnotation && (
          <>
            {/* 错误标签区 */}
            <div className={styles.errorTags}>
              <div className={styles.errorTagsTitle}>请选择错误类型</div>
              {currentErrorTags.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.tagGroup}>
                  <div className={styles.tagGroupTitle}>
                    <span>{group.title}</span>
                    {group.score !== undefined && <span className={styles.tagScore}>({group.score}分)</span>}
                    {group.isRedFlag && <span className={styles.redFlag}>底线</span>}
                  </div>
                  {group.children?.map((child, childIndex) => (
                    <div
                      key={childIndex}
                      className={styles.tagItem}
                      onClick={() => handleTagToggle(child.title, child.isRedFlag)}
                    >
                      <span className={`${styles.tagCheckbox} ${selectedTags.includes(child.title) ? styles.tagCheckboxChecked : ''}`} />
                      <span>{child.title}</span>
                      {child.isRedFlag && <span className={styles.redFlag}>底线</span>}
                    </div>
                  ))}
                  <div
                    className={styles.tagItem}
                    onClick={() => handleTagToggle(`${group.title}_无`)}
                  >
                    <span className={`${styles.tagCheckbox} ${selectedTags.includes(`${group.title}_无`) ? styles.tagCheckboxChecked : ''}`} />
                    <span>无</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 错误说明 */}
            {selectedTags.length > 0 && (
              <div className={styles.commentInput}>
                <textarea
                  className={styles.commentTextarea}
                  placeholder="请输入具体错误原因说明..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.panelFooter}>
        <div className={styles.navButtons}>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={onPrevDimension}
            disabled={currentDimensionIndex === 0}
          >
            上一维度
          </button>
          <button
            className={`${styles.btn} ${styles.btnOutline}`}
            onClick={onNextDimension}
            disabled={currentDimensionIndex === dimensions.length - 1}
          >
            下一维度
          </button>
        </div>
        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.confirmButton}`}
          onClick={handleConfirm}
        >
          确认标注
        </button>
      </div>
    </aside>
  );
}
