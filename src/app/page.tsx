// AIDP 标注工作区 - 主页面
'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import LeftNav from './LeftNav';
import MainContent from './MainContent';
import RightPanel from './RightPanel';
import LLMDebugDrawer from './LLMDebugDrawer';
import SkeletonScreen from './SkeletonScreen';
import { allCases } from '@/data/mockData';
import styles from './page.module.css';
import type { DimensionId, DimensionScore } from './types';

// 6个标注维度定义
export const DIMENSIONS = [
  { id: 'merchant_data', name: '商家数据', maxScore: 5 },
  { id: 'store_diagnosis', name: '店铺诊断', maxScore: 5 },
  { id: 'task_diagnosis', name: '任务诊断', maxScore: 5 },
  { id: 'script_generation', name: '沟通话术', maxScore: 5 },
  { id: 'agent_card', name: 'Agent卡片', maxScore: 5 },
  { id: 'send_timing', name: '发送相关', maxScore: 5 },
] as const;

export type Dimension = typeof DIMENSIONS[number];

export default function AnnotationWorkspace() {
  // 加载状态
  const [isLoading, setIsLoading] = useState(true);
  
  // 当前 Case 索引
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  
  // 当前选中的维度
  const [activeDimension, setActiveDimension] = useState<DimensionId>('merchant_data');
  
  // 各维度评分状态
  const [scores, setScores] = useState<Record<DimensionId, DimensionScore>>({
    merchant_data: { dimensionId: 'merchant_data', status: 'pending', score: null, errorTags: [], comment: '' },
    store_diagnosis: { dimensionId: 'store_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
    task_diagnosis: { dimensionId: 'task_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
    script_generation: { dimensionId: 'script_generation', status: 'pending', score: null, errorTags: [], comment: '' },
    agent_card: { dimensionId: 'agent_card', status: 'pending', score: null, errorTags: [], comment: '' },
    send_timing: { dimensionId: 'send_timing', status: 'pending', score: null, errorTags: [], comment: '' },
  });

  // LLM 调试抽屉状态
  const [llmDebugOpen, setLlmDebugOpen] = useState(false);
  const [llmDebugInput, setLlmDebugInput] = useState('');

  // 打开 LLM 调试抽屉
  const handleOpenLLMDebug = (input: string) => {
    setLlmDebugInput(input);
    setLlmDebugOpen(true);
  };

  // 模拟加载过程
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 获取当前 Case 数据
  const currentCase = allCases[currentCaseIndex];

  // 计算已完成的维度数量
  const completedCount = Object.values(scores).filter(s => s.status === 'confirmed').length;
  const totalScore = Object.values(scores).reduce((sum, s) => sum + (s.score || 0), 0);

  // 处理维度切换
  const handleDimensionChange = (dimensionId: DimensionId) => {
    setActiveDimension(dimensionId);
  };

  // 处理评分确认
  const handleScoreConfirm = (dimensionId: DimensionId, score: number, errorTags: string[], comment: string) => {
    setScores(prev => ({
      ...prev,
      [dimensionId]: {
        dimensionId,
        status: 'confirmed',
        score,
        errorTags,
        comment,
      },
    }));

    // 自动跳转到下一个未完成的维度
    const currentIndex = DIMENSIONS.findIndex(d => d.id === dimensionId);
    const nextDimension = DIMENSIONS.find((d, index) => 
      index > currentIndex && scores[d.id]?.status !== 'confirmed'
    );
    if (nextDimension) {
      setActiveDimension(nextDimension.id);
    }
  };

  // 处理上一维度/下一维度
  const handlePrevDimension = () => {
    const currentIndex = DIMENSIONS.findIndex(d => d.id === activeDimension);
    if (currentIndex > 0) {
      setActiveDimension(DIMENSIONS[currentIndex - 1].id);
    }
  };

  const handleNextDimension = () => {
    const currentIndex = DIMENSIONS.findIndex(d => d.id === activeDimension);
    if (currentIndex < DIMENSIONS.length - 1) {
      setActiveDimension(DIMENSIONS[currentIndex + 1].id);
    }
  };

  // 处理提交标注
  const handleSubmit = () => {
    if (currentCaseIndex < allCases.length - 1) {
      // 加载下一个 Case
      setCurrentCaseIndex(prev => prev + 1);
      setScores({
        merchant_data: { dimensionId: 'merchant_data', status: 'pending', score: null, errorTags: [], comment: '' },
        store_diagnosis: { dimensionId: 'store_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
        task_diagnosis: { dimensionId: 'task_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
        script_generation: { dimensionId: 'script_generation', status: 'pending', score: null, errorTags: [], comment: '' },
        agent_card: { dimensionId: 'agent_card', status: 'pending', score: null, errorTags: [], comment: '' },
        send_timing: { dimensionId: 'send_timing', status: 'pending', score: null, errorTags: [], comment: '' },
      });
      setActiveDimension('merchant_data');
    } else {
      // 所有 Case 已标注完成，显示完成页面
      alert('所有 Case 已标注完成！');
    }
  };

  // 处理标记红牌
  const handleRedCard = () => {
    if (confirm('确认将此 Case 标记为红牌（0分）？此操作将跳过所有维度评分。')) {
      // 设置所有维度为 0 分
      setScores({
        merchant_data: { dimensionId: 'merchant_data', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
        store_diagnosis: { dimensionId: 'store_diagnosis', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
        task_diagnosis: { dimensionId: 'task_diagnosis', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
        script_generation: { dimensionId: 'script_generation', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
        agent_card: { dimensionId: 'agent_card', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
        send_timing: { dimensionId: 'send_timing', status: 'confirmed', score: 0, errorTags: ['红牌标记'], comment: '' },
      });
    }
  };

  // 处理跳过
  const handleSkip = () => {
    if (currentCaseIndex < allCases.length - 1) {
      setCurrentCaseIndex(prev => prev + 1);
      setScores({
        merchant_data: { dimensionId: 'merchant_data', status: 'pending', score: null, errorTags: [], comment: '' },
        store_diagnosis: { dimensionId: 'store_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
        task_diagnosis: { dimensionId: 'task_diagnosis', status: 'pending', score: null, errorTags: [], comment: '' },
        script_generation: { dimensionId: 'script_generation', status: 'pending', score: null, errorTags: [], comment: '' },
        agent_card: { dimensionId: 'agent_card', status: 'pending', score: null, errorTags: [], comment: '' },
        send_timing: { dimensionId: 'send_timing', status: 'pending', score: null, errorTags: [], comment: '' },
      });
      setActiveDimension('merchant_data');
    }
  };

  if (isLoading) {
    return <SkeletonScreen />;
  }

  return (
    <div className={styles.workspace}>
      {/* 顶部信息栏 */}
      <Header
        currentCase={currentCase}
        completedCount={completedCount}
        totalDimensions={DIMENSIONS.length}
        onSubmit={handleSubmit}
        onSkip={handleSkip}
        canSubmit={completedCount === DIMENSIONS.length}
      />

      {/* 主体区域 */}
      <div className={styles.mainArea}>
        {/* 左侧导航栏 */}
        <LeftNav
          dimensions={DIMENSIONS}
          activeDimension={activeDimension}
          scores={scores}
          redcardPassed={currentCase.redcardPassed}
          suspectedItems={currentCase.suspectedItems}
          totalScore={totalScore}
          onDimensionChange={handleDimensionChange}
        />

        {/* 中间主内容区 */}
        <MainContent
          activeDimension={activeDimension}
          caseData={currentCase}
          onOpenLLMDebug={handleOpenLLMDebug}
        />

        {/* 右侧标注操作栏 */}
        <RightPanel
          activeDimension={activeDimension}
          dimensionName={DIMENSIONS.find(d => d.id === activeDimension)?.name || ''}
          currentScore={scores[activeDimension]}
          onScoreConfirm={handleScoreConfirm}
          onPrevDimension={handlePrevDimension}
          onNextDimension={handleNextDimension}
          dimensions={DIMENSIONS}
          currentDimensionIndex={DIMENSIONS.findIndex(d => d.id === activeDimension)}
          autoCheck={currentCase.autoChecks[activeDimension]}
        />
      </div>

      {/* LLM 调试抽屉 */}
      <LLMDebugDrawer
        isOpen={llmDebugOpen}
        onClose={() => setLlmDebugOpen(false)}
        userPrompt={llmDebugInput}
        systemPrompt=""
      />
    </div>
  );
}
