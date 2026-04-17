// 中间主内容区组件
'use client';

import { useState } from 'react';
import styles from './ContentCards.module.css';
import type { CaseData, DimensionId, ExperienceBottleneck } from './types';

// ==================== Tab 1: 商家数据 ====================
function MerchantDataContent({ caseData }: { caseData: CaseData }) {
  const { merchantData, autoChecks } = caseData;
  const check = autoChecks.merchant_data;
  const isAllPass = merchantData.summary.mismatched === 0 && merchantData.summary.missing === 0;

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={`${styles.checkSummary} ${isAllPass ? styles.checkPass : styles.checkWarning}`}>
            {isAllPass ? (
              <>全部 {merchantData.summary.total} 个字段一致 ✅</>
            ) : (
              <>
                共比对 {merchantData.summary.total} 个字段：{merchantData.summary.matched} 个一致 ✅ |{' '}
                {merchantData.summary.mismatched} 个不一致 ❌ | {merchantData.summary.missing} 个缺失 ⚠️
              </>
            )}
          </div>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'partial_fail' && <span className={styles.checkFailIcon}>❌</span>}
                {c.result === 'suspected' && <span className={styles.checkFailIcon}>❌</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据比对表格卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>AI上下文数据 vs 真实数据</div>
        <div className={styles.cardBody}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>字段名称</th>
                <th>AI上下文值</th>
                <th>真实值</th>
                <th>比对结果</th>
              </tr>
            </thead>
            <tbody>
              {merchantData.fields.map((field, i) => (
                <tr
                  key={i}
                  className={
                    field.missing
                      ? styles.rowMissing
                      : !field.match
                      ? styles.rowMismatch
                      : ''
                  }
                >
                  <td>{field.name}</td>
                  <td>{field.aiValue}</td>
                  <td>{field.realValue}</td>
                  <td>
                    {field.missing ? (
                      <span className={styles.tagWarning}>⚠️ 缺失</span>
                    ) : field.match ? (
                      <span className={styles.tagPass}>✅ 一致</span>
                    ) : (
                      <span className={styles.tagError}>❌ 不一致</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 2: 店铺诊断 ====================
interface StoreDiagnosisContentProps {
  caseData: CaseData;
  onOpenLLMDebug: (input: string) => void;
}

// 经验卡点数据定义
const EXPERIENCE_BOTTLENECKS: ExperienceBottleneck[] = [
  { 
    id: 'low_delivery_exposure', 
    priority: 'P1', 
    name: '投流力度不足导致商品曝光低', 
    isCovered: false, 
    relatedProfileFields: [
      { name: '千川投放金额', value: '0', condition: '<=0' },
      { name: '商品曝光数', value: '0', condition: '<=0' }
    ] 
  },
  { 
    id: 'shelf_no_order', 
    priority: 'P1', 
    name: '有在架无订单产生', 
    isCovered: true, 
    relatedProfileFields: [
      { name: '近7天支付订单数', value: '0', condition: '<=0' },
      { name: '在架商品数', value: '12', condition: '>0' }
    ] 
  },
];

function StoreDiagnosisContent({ caseData, onOpenLLMDebug }: StoreDiagnosisContentProps) {
  const { traceData, autoChecks } = caseData;
  const check = autoChecks.store_diagnosis;
  const [selectedBottleneck, setSelectedBottleneck] = useState<ExperienceBottleneck | null>(null);

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                {c.result === 'need_human' && <span className={styles.checkWarnIcon}>⚠️</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trace 诊断节点卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Trace 诊断节点（诊断出卡点）</span>
          <button
            className={styles.debugButton}
            onClick={() => onOpenLLMDebug(traceData.diagnosisNode.input.merchantData)}
          >
            LLM 节点调试
          </button>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.traceCompare}>
            {/* Input */}
            <div className={styles.traceInput}>
              <div className={styles.traceLabel}>Input（用户上下文）</div>
              <div className={styles.traceContent}>
                <pre className={styles.traceText}>{traceData.diagnosisNode.input.merchantData}</pre>
              </div>
            </div>
            {/* Output */}
            <div className={styles.traceOutput}>
              <div className={styles.traceLabel}>Output（模型输出）</div>
              <div className={styles.traceContent}>
                {Array.isArray(traceData.diagnosisNode.output) ? (
                  traceData.diagnosisNode.output.map((item, index) => (
                    <div key={index} style={{ marginBottom: index < traceData.diagnosisNode.output.length - 1 ? '16px' : '0', paddingBottom: index < traceData.diagnosisNode.output.length - 1 ? '16px' : '0', borderBottom: index < traceData.diagnosisNode.output.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <div className={styles.outputBlock}>
                        <span className={styles.outputLabel}>problem:</span>
                        <div className={styles.outputProblem}>{item.problem}</div>
                      </div>
                      <div className={styles.outputBlock}>
                        <span className={styles.outputLabel}>reasoning:</span>
                        <div className={styles.outputReasoning}>{item.reasoning}</div>
                      </div>
                      <div className={styles.outputBlock}>
                        <span className={styles.outputLabel}>related_experience:</span>
                        <div className={styles.outputExperience}>{item.related_experience}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.outputBlock}>
                      <span className={styles.outputLabel}>problem:</span>
                      <div className={styles.outputProblem}>{traceData.diagnosisNode.output.problem}</div>
                    </div>
                    <div className={styles.outputBlock}>
                      <span className={styles.outputLabel}>reasoning:</span>
                      <div className={styles.outputReasoning}>{traceData.diagnosisNode.output.reasoning}</div>
                    </div>
                    <div className={styles.outputBlock}>
                      <span className={styles.outputLabel}>related_experience:</span>
                      <div className={styles.outputExperience}>{traceData.diagnosisNode.output.relatedExperience}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 经验卡点覆盖度对照卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>经验卡点覆盖度对照</div>
        <div className={styles.cardBody}>
          <div className={styles.coverageCompare}>
            <div className={styles.coverageColumn}>
              <div className={styles.coverageTitle}>经验参考中的潜在卡点</div>
              <div className={styles.coverageList}>
                {EXPERIENCE_BOTTLENECKS.map((bottleneck) => (
                  <div
                    key={bottleneck.id}
                    className={`${styles.coverageItem} ${bottleneck.isCovered ? styles.covered : ''} ${
                      selectedBottleneck?.id === bottleneck.id ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedBottleneck(bottleneck)}
                  >
                    <span className={`${styles.coverageIcon} ${bottleneck.isCovered ? styles.iconPass : styles.iconGray}`}>
                      {bottleneck.isCovered ? '✓' : '?'}
                    </span>
                    <span className={styles.priorityTag}>{bottleneck.priority}</span>
                    <span>{bottleneck.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.coverageDivider} />
            <div className={styles.coverageColumn}>
              <div className={styles.coverageTitle}>
                {selectedBottleneck ? `${selectedBottleneck.name} - 关联画像信息` : '模型诊断出的卡点'}
              </div>
              <div className={styles.coverageList}>
                {selectedBottleneck ? (
                  <div className={styles.profileInfo}>
                    <div className={styles.profileTitle}>关联的商家画像信息：</div>
                    <div className={styles.profileFields}>
                      {selectedBottleneck.relatedProfileFields.map((field, idx) => (
                        <div key={idx} className={styles.profileField}>
                          <span className={styles.fieldIcon}>◆</span>
                          <span>{field.name}：{field.value}（{field.condition}）</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.profileHint}>
                      {selectedBottleneck.isCovered
                        ? '✓ 该卡点已被模型识别'
                        : '? 该卡点疑似未被识别，建议关注'}
                    </div>
                  </div>
                ) : (
                  <div className={styles.coverageItem}>
                    <span className={`${styles.coverageIcon} ${styles.iconPass}`}>✓</span>
                    <span className={styles.priorityTag}>P1</span>
                    <span>有在架无订单产生</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 3: 任务诊断 ====================
interface TaskDiagnosisContentProps {
  caseData: CaseData;
  onOpenLLMDebug: (input: string) => void;
}

function TaskDiagnosisContent({ caseData, onOpenLLMDebug }: TaskDiagnosisContentProps) {
  const { traceData, autoChecks, aiTarget } = caseData;
  const check = autoChecks.task_diagnosis;

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                {c.result === 'need_human' && <span className={styles.checkWarnIcon}>⚠️</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trace 任务诊断节点卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Trace 任务诊断节点（制定方案）</span>
          <button
            className={styles.debugButton}
            onClick={() => onOpenLLMDebug(traceData.taskNode.input.actionRules)}
          >
            LLM 节点调试
          </button>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.traceCompare}>
            {/* Input */}
            <div className={styles.traceInput}>
              <div className={styles.traceLabel}>Input（行动点决策规则）</div>
              <div className={styles.traceContent}>
                <div className={styles.inputBlock}>
                  <div className={styles.inputTitle}>### 行动点决策规则</div>
                  <pre className={styles.traceText}>{traceData.taskNode.input.actionRules}</pre>
                </div>
                <div className={styles.inputBlock}>
                  <div className={styles.inputTitle}>### 商家画像</div>
                  <pre className={styles.traceText}>{traceData.taskNode.input.merchantProfile}</pre>
                </div>
              </div>
            </div>
            {/* Output */}
            <div className={styles.traceOutput}>
              <div className={styles.traceLabel}>Output（推荐方案）</div>
              <div className={styles.traceContent}>
                <div className={styles.outputBlock}>
                  <span className={styles.outputLabel}>advice:</span>
                  <div className={styles.outputAdvice}>{traceData.taskNode.output.advice}</div>
                </div>
                <div className={styles.outputBlock}>
                  <span className={styles.outputLabel}>action_id:</span>
                  <div className={styles.outputCode}>{traceData.taskNode.output.actionId}</div>
                </div>
                <div className={styles.outputBlock}>
                  <span className={styles.outputLabel}>reasoning:</span>
                  <div className={styles.outputReasoning}>{traceData.taskNode.output.reasoning}</div>
                </div>
                <div className={styles.outputBlock}>
                  <span className={styles.outputLabel}>more options:</span>
                  <div className={styles.moreOptions}>
                    {traceData.taskNode.output.more.map((opt, i) => (
                      <div key={i} className={styles.moreOption}>
                        <span className={styles.moreOptionName}>{opt.name}</span>
                        <span className={styles.moreOptionReason}>（{opt.reason}）</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 优先级规则辅助判断卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>优先级规则速查</div>
        <div className={styles.cardBody}>
          <div className={styles.priorityCheck}>
            <div className={styles.priorityCondition}>
              <span className={styles.priorityLabel}>当前场景：</span>
              <span>持续动销 | 在架商品数=12 | 千川未开通</span>
            </div>
            <div className={styles.priorityRule}>
              <span className={styles.priorityLabel}>按决策规则应优先推荐：</span>
              <span className={styles.priorityHighlight}>分享商品出首单</span>
            </div>
            <div className={styles.priorityActual}>
              <span className={styles.priorityLabel}>实际推荐：</span>
              <span>{aiTarget}</span>
            </div>
            <div className={styles.priorityConclusion}>
              <span className={styles.checkWarnIcon}>⚠️</span>
              <span>推荐与优先级规则可能不匹配，请核实</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 4: 话术生成 ====================
function ScriptGenerationContent({ caseData }: { caseData: CaseData }) {
  const { touchHistory, traceData, autoChecks } = caseData;
  const check = autoChecks.script_generation;

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 会话时光机卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>会话时光机 - 触达上下文</div>
        <div className={styles.cardBody}>
          <div className={styles.messageList}>
            {touchHistory.messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.messageItem} ${msg.isCurrent ? styles.currentMessage : ''}`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageTime}>[{msg.timestamp}]</span>
                  <span className={styles.messageType}>AI小二触达</span>
                  {msg.isCurrent && <span className={styles.currentTag}>★ 当前触达</span>}
                </div>
                <div className={styles.messageContent}>
                  <pre className={styles.messageText}>{msg.content}</pre>
                  {msg.hasCard && (
                    <div className={styles.cardPreview}>
                      <span className={styles.cardIcon}>🎴</span>
                      <span>{msg.cardTitle}</span>
                    </div>
                  )}
                </div>
                {i < touchHistory.messages.length - 1 && (
                  <div className={styles.messageDivider} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trace 话术生成节点卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>Trace 话术生成节点（沟通话术）</div>
        <div className={styles.cardBody}>
          <div className={styles.scriptOutput}>
            <pre className={styles.scriptText}>{traceData.scriptNode.output.scriptContent}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 5: Agent 卡片 ====================
function AgentCardContent({ caseData }: { caseData: CaseData }) {
  const { agentCard, autoChecks } = caseData;
  const check = autoChecks.agent_card;

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                {c.result === 'error' && <span className={styles.checkFailIcon}>❌</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 卡片渲染预览卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>卡片渲染预览 + 字段校验清单</div>
        <div className={styles.cardBody}>
          <div className={styles.cardPreviewArea}>
            {/* 卡片预览 */}
            <div className={styles.cardPreviewColumn}>
              <div className={styles.previewTitle}>卡片预览</div>
              <div className={styles.imCard}>
                <div className={styles.imCardImage}>
                  <span className={styles.imCardImageText}>三月店铺经营激励🎁</span>
                </div>
                <div className={styles.imCardBody}>
                  <div className={styles.imCardTitle}>最高可获200元推广金</div>
                  <div className={styles.imCardDesc}>48926商家已参加</div>
                  <button className={styles.imCardButton}>去报名</button>
                </div>
              </div>
            </div>
            {/* 字段校验清单 */}
            <div className={styles.cardValidationColumn}>
              <div className={styles.previewTitle}>字段校验清单</div>
              <div className={styles.validationList}>
                {agentCard.validation.map((v, i) => (
                  <div key={i} className={styles.validationItem}>
                    <span className={styles.validationItemName}>{v.item}</span>
                    <span className={`${styles.validationResult} ${
                      v.result === 'pass' ? styles.validationPass :
                      v.result === 'warning' ? styles.validationWarn :
                      styles.validationError
                    }`}>
                      {v.result === 'pass' && '✅'}
                      {v.result === 'warning' && '⚠️'}
                      {v.result === 'error' && '❌'}
                    </span>
                    <span className={styles.validationDetail}>{v.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Tab 6: 发送时机 ====================
function SendTimingContent({ caseData }: { caseData: CaseData }) {
  const { touchHistory, autoChecks } = caseData;
  const check = autoChecks.send_timing;

  return (
    <div className={styles.dimensionContent}>
      {/* 机标预检结果卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>机标预检结果</div>
        <div className={styles.cardBody}>
          <div className={styles.checkList}>
            {check.checks.map((c, i) => (
              <div key={i} className={styles.checkItem}>
                {c.result === 'pass' && <span className={styles.checkPassIcon}>✅</span>}
                {c.result === 'warning' && <span className={styles.checkWarnIcon}>⚠️</span>}
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 触达时间线卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>近7天触达时间线</div>
        <div className={styles.cardBody}>
          <div className={styles.timeline}>
            <div className={styles.timelineAxis}>
              {['3/5', '3/6', '3/7', '3/8', '3/9', '3/10', '3/11'].map((date, i) => (
                <div key={i} className={styles.timelineDate}>
                  <span>{date}</span>
                </div>
              ))}
            </div>
            <div className={styles.timelineDots}>
              <div className={styles.timelineDot} style={{ left: '0%' }}>
                <span className={styles.timelineDotIcon}>●</span>
                <span className={styles.timelineDotTime}>10:15</span>
                <span className={styles.timelineDotAction}>商品优化</span>
              </div>
              <div className={styles.timelineDot} style={{ left: '42.8%' }}>
                <span className={styles.timelineDotIcon}>●</span>
                <span className={styles.timelineDotTime}>14:22</span>
                <span className={styles.timelineDotAction}>千川投流</span>
              </div>
              <div className={`${styles.timelineDot} ${styles.timelineDotCurrent}`} style={{ left: '100%' }}>
                <span className={styles.timelineDotIcon}>★</span>
                <span className={styles.timelineDotTime}>11:47</span>
                <span className={styles.timelineDotAction}>报名成长任务</span>
              </div>
            </div>
          </div>
          <div className={styles.timelineStats}>
            <div className={styles.statItem}>
              <span className={styles.checkPassIcon}>✅</span>
              <span>7天总触达次数：{touchHistory.timeline.total7day}次</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.checkPassIcon}>✅</span>
              <span>最短触达间隔：{touchHistory.timeline.minIntervalDays}天</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.checkPassIcon}>✅</span>
              <span>触达时段：10:15 / 14:22 / 11:47 均在活跃时段</span>
            </div>
          </div>
        </div>
      </div>

      {/* 会话时光机卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>会话时光机 - 触达上下文</div>
        <div className={styles.cardBody}>
          <div className={styles.messageList}>
            {touchHistory.messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.messageItem} ${msg.isCurrent ? styles.currentMessage : ''}`}
              >
                <div className={styles.messageHeader}>
                  <span className={styles.messageTime}>[{msg.timestamp}]</span>
                  <span className={styles.messageType}>AI小二触达</span>
                  {msg.isCurrent && <span className={styles.currentTag}>★ 当前触达</span>}
                </div>
                <div className={styles.messageContent}>
                  <pre className={styles.messageText}>{msg.content}</pre>
                  {msg.hasCard && (
                    <div className={styles.cardPreview}>
                      <span className={styles.cardIcon}>🎴</span>
                      <span>{msg.cardTitle}</span>
                    </div>
                  )}
                </div>
                {i < touchHistory.messages.length - 1 && (
                  <div className={styles.messageDivider} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 日期与时效性检查卡片 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>日期与时效性检查</div>
        <div className={styles.cardBody}>
          <div className={styles.dateCheck}>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>话术中提及日期信息：</span>
              <span>"三月店铺经营激励...今天就截止啦"</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>触达日期：</span>
              <span>2026-03-11</span>
            </div>
            <div className={styles.dateItem}>
              <span className={styles.dateLabel}>任务截止时间：</span>
              <span>2026-03-31</span>
            </div>
            <div className={styles.dateConclusion}>
              <span className={styles.checkPassIcon}>✅</span>
              <span>话术日期表述合理，任务在有效期内</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 内容映射 ====================
type StoreDiagnosisContentFC = React.FC<{ caseData: CaseData; onOpenLLMDebug: (input: string) => void }>;
type TaskDiagnosisContentFC = React.FC<{ caseData: CaseData; onOpenLLMDebug: (input: string) => void }>;
type DefaultContentFC = React.FC<{ caseData: CaseData }>;

const CONTENT_MAP: Record<DimensionId, DefaultContentFC | StoreDiagnosisContentFC | TaskDiagnosisContentFC> = {
  merchant_data: MerchantDataContent,
  store_diagnosis: StoreDiagnosisContent as StoreDiagnosisContentFC,
  task_diagnosis: TaskDiagnosisContent as TaskDiagnosisContentFC,
  script_generation: ScriptGenerationContent,
  agent_card: AgentCardContent,
  send_timing: SendTimingContent,
};

// ==================== 主组件 ====================
interface MainContentProps {
  activeDimension: DimensionId;
  caseData: CaseData;
  onOpenLLMDebug: (input: string) => void;
}

export default function MainContent({ activeDimension, caseData, onOpenLLMDebug }: MainContentProps) {
  const ContentComponent = CONTENT_MAP[activeDimension];

  return (
    <main className={styles.mainContent}>
      <div className={styles.contentInner}>
        <ContentComponent caseData={caseData} onOpenLLMDebug={onOpenLLMDebug} />
      </div>
    </main>
  );
}
