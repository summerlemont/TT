// AIDP 标注工作区 Mock 数据
import type { CaseData, DimensionId } from '../app/types';

// ==================== Case 1：正常 Case ====================
export const case1: CaseData = {
  caseId: '762358959175849734',
  caseIndex: 1,
  totalCases: 3,
  shopId: '257269496',
  shopName: '南京水果生鲜供应仓',
  diagnoseDate: '2026-03-31',
  channel: '抖店IM',
  aiTarget: '报名商家成长任务',
  scene: '持续动销',
  redcardPassed: true,
  suspectedItems: [],
  
  // 商家数据比对
  merchantData: {
    fields: [
      { name: '营业状态', aiValue: '正常营业', realValue: '正常营业', match: true },
      { name: '经营分型', aiValue: '货架型', realValue: '货架型', match: true },
      { name: '店铺类型', aiValue: '个人店', realValue: '个人店', match: true },
      { name: '主营类目', aiValue: '生鲜', realValue: '生鲜', match: true },
      { name: '在架商品数', aiValue: '12', realValue: '12', match: true },
      { name: '近30天GMV', aiValue: '3,456元', realValue: '3,456元', match: true },
      { name: '近30天订单数', aiValue: '28', realValue: '28', match: true },
      { name: '近30天动销商品数', aiValue: '5', realValue: '5', match: true },
      { name: '好评率', aiValue: '92%', realValue: '92%', match: true },
      { name: '精选联盟状态', aiValue: '已加入', realValue: '未加入', match: false },
      { name: '商家生命周期', aiValue: '成长期', realValue: '成长期', match: true },
      { name: '商家分型', aiValue: '-', realValue: '货架型', match: false, missing: true },
      { name: '体验分', aiValue: '4.6', realValue: '4.6', match: true },
      { name: '近7天直播时长', aiValue: '0小时', realValue: '0小时', match: true },
      { name: '千川投流状态', aiValue: '未开通', realValue: '未开通', match: true },
    ],
    summary: { total: 15, matched: 13, mismatched: 1, missing: 1 },
  },

  // Trace 节点数据
  traceData: {
    diagnosisNode: {
      nodeName: '诊断出卡点',
      input: {
        merchantData: `## 商家数据
- 营业状态：正常营业
- 在架商品数：12
- 近30天GMV：3,456元
- 近30天动销商品数：5
- 好评率：92%
- 精选联盟：已加入（实际：未加入）
- 千川投流：未开通
- 体验分：4.6

## 经验参考
目标: 首次动销，商家在该目标下常遇到的卡点: ["无在架商品，但存在审核驳回的商品","无在架商品，发品被阻断，提示品牌资质报错","无在架商品，发品被阻断，提示识别不通过","无在架商品，发品被阻断，提示该类目商品需上传完整尺码表报错","近7日浏览三个以上商品专区，但无在架商品","近7日浏览源头好货界面一次及以上，但无在架商品","近7日浏览商机中心页面一次及以上，但无在架商品","近7日点击进入商品创建页一次及以上，且无在架商品","无在架商品，但存在商品草稿","在架商品数大于等于1，但动销商品数为0","未复制过商品链接","复制过商品分享链接，但链接无曝光，商品未出单","复制过商品链接，链接有曝光，但商品未出单","有5个以上商品信息待优化"]`,
        experienceReference: `### 经验参考
目标: 首次动销，商家在该目标下常遇到的卡点: ["无在架商品，但存在审核驳回的商品","无在架商品，发品被阻断，提示品牌资质报错","无在架商品，发品被阻断，提示识别不通过","无在架商品，发品被阻断，提示该类目商品需上传完整尺码表报错","近7日浏览三个以上商品专区，但无在架商品","近7日浏览源头好货界面一次及以上，但无在架商品","近7日浏览商机中心页面一次及以上，但无在架商品","近7日点击进入商品创建页一次及以上，且无在架商品","无在架商品，但存在商品草稿","在架商品数大于等于1，但动销商品数为0","未复制过商品链接","复制过商品分享链接，但链接无曝光，商品未出单","复制过商品链接，链接有曝光，但商品未出单","有5个以上商品信息待优化"]`,
      },
      output: [
        {
          problem: '在架商品数大于等于1，但动销商品数为0',
          reasoning: '在架商品数为1，近7天支付订单数为0，近30天支付订单数为0，表明有在架商品但未产生动销；该问题属于经验参考中首次动销目标下商家常遇到的卡点',
          related_queries: [],
          related_experience: '在架商品数大于等于1，但动销商品数为0'
        }
      ],
    },
    taskNode: {
      nodeName: '制定方案',
      input: {
        actionRules: `["付费的行动点为：开通运费险、千川投广、设置营销工具（评价有礼）设置营销工具（单品直降）、设置营销工具（商品优惠券）、使用千川红包、投广托管、开通运费险、设置营销工具-新人礼金、学习精选联盟开通课程、学习精选联盟发品的课程;非付费的行动点为：查看商机中心、发布新品挂车短视频、分享商品、商品信息优化、学习猜你喜欢的课程、找源头好货、驳回自动整改、学习直播诊断课程、一键发布直播切片、绑定官方账号、托管小卡;如果店铺同时诊断出付费卡点和非付费的卡点时,优先针对非付费卡点问题提示改善建议。"]`,
        actionReference: `- 报名商家成长任务：适用于商家未报名成长任务且有可报名任务时
	- 开通千川投流：适用于商家千川未开通且商品基础良好时
	- 开通精选联盟：适用于商家满足联盟准入条件但未开通时
	- 分享商品：适用于首次动销且在架商品>0时`,
        merchantProfile: `"停业状态":""`,
      },
      output: {
        problem: '投流力度不足，商品曝光低',
        advice: '报名商家成长任务，完成后可获取流量推广金等权益扶持，帮助店铺获取更多流量',
        actionId: 'register_shop_growth_task',
        reasoning: '商家千川投流未开通，当前有可报名的成长任务"三月店铺经营激励"，完成任务可获得流量推广金，降低投流门槛。虽然直接开通千川也能解决问题，但成长任务提供了额外权益，是更优选择。',
        more: [
          { name: '开通千川投流', actionId: 'open_qianchuan', reason: '直接解决投流问题，但缺少权益激励' },
          { name: '开通精选联盟', actionId: 'open_alliance', reason: '商家满足条件，但非当前核心卡点' },
        ],
      },
    },
    scriptNode: {
      nodeName: '沟通话术',
      output: {
        scriptContent: `南京水果生鲜供应仓老板，【三月店铺经营激励🎁】今天就截止啦！🎉
现在同行都已报名，完成任务有机会领取流量推广金💰，帮您获取更多流量哦～
报名超简单，1-2秒就能搞定，快行动吧！`,
      },
    },
  },

  // 会话时光机数据
  touchHistory: {
    messages: [
      {
        timestamp: '2026-03-05 10:15',
        type: 'ai_touch',
        actionPoint: '商品优化',
        content: '南京水果生鲜供应仓老板您好～看到咱们店铺在架商品12款，品类还挺丰富的呢！建议可以优化一下商品标题和主图，让商品更容易被消费者搜到哦～',
        hasCard: false,
        isCurrent: false,
      },
      {
        timestamp: '2026-03-08 14:22',
        type: 'ai_touch',
        actionPoint: '千川投流',
        content: `南京水果生鲜供应仓老板您好呀😊
看到咱们店铺最近经营数据不错呢，在架商品12款，近30天GMV有3,456元💰
不过发现咱们还没开通巨量千川呢，开通后可以帮助商品获得更多曝光哦～
点击下方链接了解详情👇`,
        hasCard: true,
        cardTitle: '开通巨量千川',
        isCurrent: false,
      },
      {
        timestamp: '2026-03-11 11:47',
        type: 'ai_touch',
        actionPoint: '报名成长任务',
        content: `★ 当前触达
南京水果生鲜供应仓老板，【三月店铺经营激励🎁】今天就截止啦！🎉
现在同行都已报名，完成任务有机会领取流量推广金💰，帮您获取更多流量哦～
报名超简单，1-2秒就能搞定，快行动吧！`,
        hasCard: true,
        cardTitle: '三月店铺经营激励',
        isCurrent: true,
      },
    ],
    timeline: {
      dateRange: ['2026-03-05', '2026-03-11'],
      touches: [
        { date: '2026-03-05', time: '10:15', action: '商品优化' },
        { date: '2026-03-08', time: '14:22', action: '千川投流' },
        { date: '2026-03-11', time: '11:47', action: '报名成长任务' },
      ],
      total7day: 2,
      minIntervalDays: 3,
    },
  },

  // Agent 卡片数据
  agentCard: {
    cardJson: {
      msg_type: 'card',
      card: {
        CardTemplateJSON: {
          template_type: 'ddim_custom_card',
          params: {
            type: 'mixedLayout',
            data: {
              content: '<style-apply>in_1</style-apply>',
              title: '三月店铺经营激励🎁',
              content_text: '最高可获200元推广金',
              bottom_list: [{ text: '48926商家已参加' }],
              button: { text: '去报名' },
              action: {
                action_code: 'register_shop_growth_task',
                action_name: '报名任务',
              },
              action_list: [
                {
                  type: 'customAction',
                  station_type: 'pc-im',
                  content: {
                    actionType: 'jumpUrl',
                    options: {
                      url: 'https://fxg.jinritemai.com/m/wecom-contact/jumpWithPic?activity_type=task_apply&cdn_file=task_apply&taskCode=STP7605870339227648',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    validation: [
      { item: '卡片类型', result: 'pass', detail: 'ddim_custom_card' },
      { item: '标题 (title)', result: 'pass', detail: '"三月店铺经营激励🎁"' },
      { item: '内容文本', result: 'pass', detail: '"最高可获200元推广金"' },
      { item: '按钮文案', result: 'pass', detail: '"去报名"' },
      { item: '底部信息', result: 'pass', detail: '"48926商家已参加"' },
      { item: '跳转链接', result: 'pass', detail: 'task_apply 页面，HTTP 200' },
      { item: '图片', result: 'warning', detail: '需人工确认图片与话术内容一致性' },
    ],
  },

  // 机标预检结果
  autoChecks: {
    merchant_data: {
      autoScore: null,
      confidence: 'high',
      status: 'warning',
      checks: [
        { item: '数据字段比对', result: 'partial_fail', detail: '15个字段中1个不一致、1个缺失' },
        { item: '接口传参错误', result: 'suspected', detail: '精选联盟状态不一致' },
        { item: '数据缺失', result: 'warning', detail: '商家分型字段缺失' },
      ],
    },
    store_diagnosis: {
      autoScore: null,
      confidence: 'medium',
      status: 'warning',
      checks: [
        { item: 'Output非空检查', result: 'pass', detail: 'Output有内容' },
        { item: '数据引用一致性', result: 'pass', detail: '诊断引用数据与画像一致' },
        { item: '诊断全面性', result: 'need_human', detail: '需人工对照经验参考判断' },
      ],
    },
    task_diagnosis: {
      autoScore: null,
      confidence: 'medium',
      status: 'warning',
      checks: [
        { item: '商家营业状态', result: 'pass', detail: '正常营业' },
        { item: '行动点存在性', result: 'pass', detail: 'register_shop_growth_task 存在' },
        { item: '优先级规则', result: 'need_human', detail: '持续动销场景，投流问题属第三优先级，推荐成长任务需核实' },
      ],
    },
    script_generation: {
      autoScore: null,
      confidence: 'low',
      status: 'warning',
      checks: [
        { item: '链接有效性', result: 'pass', detail: '2个链接全部可达' },
        { item: 'Emoji密度', result: 'warning', detail: '占比6.8%，略高于5%阈值' },
        { item: '字数', result: 'pass', detail: '186字，未超220字' },
        { item: '店铺名称', result: 'pass', detail: '开头包含"南京水果生鲜供应仓"' },
        { item: '话术相似度', result: 'warning', detail: '与上次触达相似度82%' },
        { item: '行动点匹配', result: 'pass', detail: '话术行动点与推荐一致' },
      ],
    },
    agent_card: {
      autoScore: 5,
      confidence: 'high',
      status: 'pass',
      checks: [
        { item: 'JSON格式', result: 'pass', detail: '格式合法' },
        { item: '必填字段', result: 'pass', detail: 'title/content/button/action_list齐全' },
        { item: '链接可达性', result: 'pass', detail: 'HTTP 200' },
        { item: '链接任务匹配', result: 'pass', detail: '指向task_apply，与推荐任务匹配' },
        { item: '图片内容', result: 'need_human', detail: '需人工确认' },
      ],
    },
    send_timing: {
      autoScore: 5,
      confidence: 'high',
      status: 'pass',
      checks: [
        { item: '触达时间', result: 'pass', detail: '11:47，在8:00-22:00内' },
        { item: '7天频次', result: 'pass', detail: '2次，≤3次' },
        { item: '24h重复', result: 'pass', detail: '24h内无重复' },
        { item: '日期一致性', result: 'pass', detail: '3月任务，3月触达' },
        { item: '任务有效期', result: 'pass', detail: '截止3/31，触达3/11' },
      ],
    },
  },
};

// ==================== Case 2：有底线问题的 Case ====================
export const case2: CaseData = {
  ...case1,
  caseId: '762358959175849735',
  caseIndex: 2,
  shopName: '甜心烘焙工坊',
  aiTarget: '开通精选联盟',
  redcardPassed: false,
  suspectedItems: ['Agent卡片链接指向错误任务（底线）'],
  
  merchantData: {
    fields: case1.merchantData.fields.map(f => ({ ...f, match: true })),
    summary: { total: 15, matched: 15, mismatched: 0, missing: 0 },
  },

  agentCard: {
    ...case1.agentCard,
    validation: [
      { item: '卡片类型', result: 'pass', detail: 'ddim_custom_card' },
      { item: '标题 (title)', result: 'pass', detail: '"三月店铺经营激励🎁"' },
      { item: '内容文本', result: 'pass', detail: '"最高可获200元推广金"' },
      { item: '按钮文案', result: 'pass', detail: '"去报名"' },
      { item: '底部信息', result: 'pass', detail: '"48926商家已参加"' },
      { item: '跳转链接', result: 'error', detail: '链接指向"报名成长任务"，但推荐的是"开通精选联盟" ❌' },
      { item: '图片', result: 'warning', detail: '需人工确认' },
    ],
  },

  autoChecks: {
    ...case1.autoChecks,
    merchant_data: {
      autoScore: 5,
      confidence: 'high',
      status: 'pass',
      checks: [
        { item: '数据字段比对', result: 'pass', detail: '15个字段全部一致' },
      ],
    },
    agent_card: {
      autoScore: 0,
      confidence: 'high',
      status: 'error',
      checks: [
        { item: 'JSON格式', result: 'pass', detail: '格式合法' },
        { item: '必填字段', result: 'pass', detail: 'title/content/button/action_list齐全' },
        { item: '链接可达性', result: 'pass', detail: 'HTTP 200' },
        { item: '链接任务匹配', result: 'error', detail: '链接指向"报名成长任务"，但推荐的是"开通精选联盟" 🔴' },
        { item: '图片内容', result: 'warning', detail: '需人工确认' },
      ],
    },
  },
};

// ==================== Case 3：全部通过的 Case ====================
export const case3: CaseData = {
  ...case1,
  caseId: '762358959175849736',
  caseIndex: 3,
  shopName: '潮流数码旗舰店',
  aiTarget: '分享商品引导破零',
  redcardPassed: true,
  suspectedItems: [],

  merchantData: {
    fields: case1.merchantData.fields.map(f => ({ ...f, match: true })),
    summary: { total: 15, matched: 15, mismatched: 0, missing: 0 },
  },

  autoChecks: {
    merchant_data: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '数据字段比对', result: 'pass', detail: '15个字段全部一致' }] },
    store_diagnosis: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '全部检查', result: 'pass', detail: '诊断正常' }] },
    task_diagnosis: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '全部检查', result: 'pass', detail: '任务诊断正常' }] },
    script_generation: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '全部检查', result: 'pass', detail: '话术生成正常' }] },
    agent_card: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '全部检查', result: 'pass', detail: '卡片正常' }] },
    send_timing: { autoScore: 5, confidence: 'high', status: 'pass', checks: [{ item: '全部检查', result: 'pass', detail: '发送时机正常' }] },
  },
};

// 导出所有 Case
export const allCases = [case1, case2, case3];

// 经验卡点列表（用于店铺诊断维度）
export const experienceCardPoints = [
  { name: '在架商品不足', covered: false },
  { name: '动销低', covered: false },
  { name: '好评率低', covered: false },
  { name: '投流不足', covered: true },
  { name: '直播时长不足', covered: true },
];
