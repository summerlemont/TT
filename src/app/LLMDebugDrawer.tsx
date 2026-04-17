// LLM 节点调试抽屉组件
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './LLMDebugDrawer.module.css';

interface LLMDebugDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  systemPrompt: string;
  userPrompt: string;
}

// System Prompt 模板
const DEFAULT_SYSTEM_PROMPT = `## 角色
你是一名抖音电商平台的经营诊断专家，负责帮助商家实现经营目标。

## 任务
根据商家提供的基础画像、经营数据、对话数据、行为数据，结合经验和知识参考，诊断出当前商家的经营卡点。
1. 优先判断商家是否面临参考经验中提到的商家常见卡点，判断必须有数据依据，如果存在这部分卡点则直接给出
2. 如果商家没有面临常见卡点的情况下，你需要从对话里识别和目标强相关的卡点 以及 从数据中分析出和目标未达成的可能卡点，然后根据出现的问题数量给出影响目标达成最重要的卡点
3. 如果存在优秀同行数据的情况下，将商家自身数据跟优秀同行数据做对比，必须是相同指标进行对比，禁止在不同指标下将商家自身数据跟优秀同行对比，如果相同指标对比同行有差距，也认为是卡点
4. 从所有卡点中提取对目标影响最大的1-2个卡点，注意，商家常见卡点优先，如果商家有未使用权益属于随心推券、千川红包、千川优惠券等类型，并且在有效期内，优先推荐使用千川红包该行动点
5. 商家画像里面存在近7天支付订单数为0且累计动销商品数为1，但是近30天支付订单数大于15单时，禁止诊断卡点为商品未动销

## 输入数据要求
1. **基础画像**：包括但不限于店铺ID、主营类目、在架商品数、是否有货源、营业天数（首次正常营业距当前天数）、近7天支付订单数、近7天直播次数等。
2. **经营数据**：包括但不限于在架品列表、驳回品列表等。
3. **对话数据**：包括但不限于商家在企微、抖店IM、外呼的常问问题（例如："如何增加类目资质"）。
4. **行为数据**：包括但不限于近7天访问商品发布页次数、访问商机中心页次数、访问精选货源页次数。
5. **优秀同行数据**：商家优秀同行的关键经营数据
6. **经验参考**：常见卡点及应对
   注意：其他卡点，如果数据中显示商家存在其他问题（如商品无曝光、无点击、无转化等），也请根据数据表现提出卡点，并给出合理的方案和行动点。
7. **知识参考**：卡点可参考方案

## 输出格式要求
请按照以下格式输出诊断建议,要求**只输出json文本**，格式如下：
[
    {
        "problem": string, /*卡点名称，简要描述，如果卡点描述为如果存在xxx问题，说明商家存在yyy问题，返回yyy问题本身*/
        "reasoning": string, /*卡点诊断的数据依据以及判断关联问题和经验的依据，[相关数据字段]的值表明...（例如：驳回品列表中有X个商品被驳回；近7天访问商品发布页Y次但无上架）*/
        "related_queries": list<string>, /*关联问题：对话数据中商家询问了"..."，且和卡点强相关，且诊断依据中有提到（如果有相关对话）*/,
        "related_experience": string, /*关联经验：商家遇到了经验参考中商家常遇到的卡点"..."，且诊断依据中有提到（如果有相关卡点）*/,
    },
    ...
]

注意：诊断要基于数据，每个卡点都要有数据支撑。

示例：
  假设输入数据：基础画像中在架商品数为0，行为数据中近7天访问商品发布页次数为5次，商家已有的商品草稿数大于0，对话数据中有问题"如何上架商品"。
输出：
[
    {
        "problem": "商家无在架品但有草稿未发布",
        "reasoning": "在架商品数为0，但近7天访问商品发布页5次，表明商家多次尝试上架但未成功；商家询问如何上架商品，这和当前卡点有因果关系说明上架不熟悉发布商品的流程；该问题同时也在商家常见卡点范围，所以关联了这部分经验",
        "related_queries": ["如何上架商品"],
        "related_experience": "无在架商品，但存在商品草稿"
    }
]

## 约束
1. 假设你认为卡点"商品有曝光但未出单"的关联经验是"复制过商品链接，链接有曝光，但商品未出单"，如果没有明确是否复制商品链接的数据，则不可强行关联
2. 如果从商家数据缺失或无法从数据中分析出卡点，可以返回[]`;

// Mock 输出
const MOCK_ASSISTANT_OUTPUT = `[
    {
        "problem": "商品好评率过低导致商品流量少",
        "reasoning": "近30日好评率≥85%的商品数量为0，好评率<85%的商品数量为2988，说明店铺内所有商品的好评率均低于85%，这会导致商品在平台的权重降低，曝光和流量减少；同时与优秀同行（开通巨量千川、精选联盟）对比，差距明显",
        "related_queries": [],
        "related_experience": "如果存在动销商品数≥2，且商品好评率≥85%的商品数＜2，在架商品数≥10，说明商家存在商品好评率过低导致商品流量少的问题"
    },
    {
        "problem": "未开通巨量千川，投流力度不足",
        "reasoning": "是否开通巨量千川为false，近30天和近7天千川消耗金额均为0，商品曝光主要依赖自然流量；优秀同行已开通巨量千川，投流能力差距明显；待使用权益为null，无千川红包可用",
        "related_queries": [],
        "related_experience": "如果存在商家的在架商品数大于等于10，且商品优化完成后；未开通巨量千川，说明商家存在投流力度不足的问题"
    }
]`;

// Mock User Prompt 模板
const DEFAULT_USER_PROMPT = `## 输入数据
-----
### 商家经营目标
持续动销

### 商家数据(基础画像、经营数据、行为数据)
{"14日直播曝光观看率":"0.00%","30天动销商品数":"3","30日商品品退率":"0","30日直播曝光观看率":"0.00%","7日直播曝光观看率":"0.00%","90天内是否有直播":"false","90天内是否有联盟带货开播":"false","主营一级类目":"服饰配件/皮带/帽子/围巾","主营二级类目":"帽子","停业状态":"","入驻90天后-是否开通运费险":"是","发品过程中前端报错信息":"[{\"报错原因\":\"后端拦截\"}]","商品人审信息列表":"[]","商品最近一次人审结果":"","商家体验分":"0","商家分型":"货架型","商家品牌id":"","商家在企微近7日是否回复":"否","商家在企微近7日是否点击链接":"否","商家在抖店IM近1日对智能小二消息回复次数":"0","商家在抖店IM近1日对智能小二消息读取次数":"0","商家在抖店IM近1日对智能小二消息链接点击次数":"0","商家在抖店IM近3日对智能小二消息回复次数":"0","商家在抖店IM近3日对智能小二消息读取次数":"0","商家在抖店IM近3日对智能小二消息链接点击次数":"0","商家在抖店IM近7日对智能小二消息回复次数":"0","商家在抖店IM近7日对智能小二消息读取次数":"1","商家在抖店IM近7日对智能小二消息链接点击次数":"0","商家是否90天内缴纳保证金":"否","商家是否点击分享任务":"否","商家是否被下发分享任务":"是","商家最近14天上架商品数":"2990","商家最近14天直播复盘页面曝光次数":"0","商家最近30天直播复盘页面曝光次数":"0","商家最近7天直播复盘页面曝光次数":"0","商机分发时是否能获取商家特征":"是","在架商品数":"2988","广告主ID":"0","店铺GMV等级":"<1.5W","店铺ID":"273073902","店铺主营品牌名称":"","店铺主营垂类":"","店铺主营垂类id":"0","店铺主营类目":"服饰配件/皮带/帽子/围巾","店铺主营类目id":"0","店铺体验分-商品分":"0","店铺体验分-服务分":"0","店铺体验分-物流分":"0","店铺入驻时间":"2026-03-24","店铺名称":"蕉衣4号运动仓","店铺地址":"福建省泉州市南安市梅山镇芙蓉东路菜鸟驿站转aks五楼","店铺类型":"个体店","店铺营业状态":"正常营业","待使用权益":"null","成长体验分":"70","成长商品分":"70","成长服务分":"70","成长物流分":"70","打款验证状态":"打款验证成功","抖店最近1次活跃日期":"20260329","抖店近14天活跃天数":"6","抖店近7天活跃天数":"6","是否多多大商":"否","是否定品招商商家":"否","是否宝藏小店":"否","是否工厂型商家线索":"否","是否开通千川随心推":"false","是否开通巨量千川":"否","是否开通店铺装修":"false","是否开通精选联盟":"否","是否支持运费险":"true","是否是总店":"否","是否最近1天访问商机中心":"否","是否最近1天访问源头好货":"否","是否最近7天访问商机中心":"否","是否最近7天访问源头好货":"否","是否有货源":"否","是否符合联盟入驻标准":"是","是否绑定官号":"否","是否绑定授权号":"否","是否老店新开":"true","是否足额缴纳作者保证金":"否","是否跨境店铺":"否","是否配置新人礼金":"否","最新上架商品时间":"2026-03-29 07:02:59","最近14天发布挂车短视频数":"0","最近14天商品卡成交GMV（元）":"76.16","最近14天商家官方账号直播商品展现PV":"0","最近14天商家官方账号直播商品点击PV":"0","最近14天商家官方账号直播有效观看数":"0","最近14天直播成交GMV（元）":"0.00","最近14天直播曝光次数":"0","最近14天直播观看次数":"0","最近14天直播观看转化率":"0.00%","最近14天短视频成交GMV（元）":"0.00","最近14天联盟商品支付GMV（元）":"0.00","最近30天发布挂车短视频数":"0","最近30天商品卡成交GMV（元）":"76.16","最近30天商品点击数":"39","最近30天商家官方账号直播有效观看数":"0","最近30天直播成交GMV（元）":"0.00","最近30天直播曝光次数":"0","最近30天直播观看次数":"0","最近30天直播观看转化率":"0.00%","最近30天联盟商品支付GMV（元）":"0.00","最近7天动销商品数":"3","最近7天发布挂车短视频数":"0","最近7天商品卡成交GMV（元）":"76.16","最近7天商家入池猜喜商品数":"0","最近7天商家官方账号直播商品展现PV":"0","最近7天商家官方账号直播商品点击PV":"0","最近7天商家官方账号直播有效观看数":"0","最近7天商家采纳的SEO优化商品数":"0","最近7天开通精选联盟商品数":"0","最近7天直播成交GMV（元）":"0.00","最近7天直播曝光次数":"0","最近7天直播观看次数":"0","最近7天直播观看转化率":"0.00%","最近7天短视频成交GMV（元）":"0.00","最近7天联盟商品支付GMV（元）":"0.00","本月上架新商品数":"2988","本月优化标题商品数":"0","本月发布挂车短视频数":"0","本月合作出单达人数":"0","本月挂购物车直播时长(小时)":"0.00","本月猜你喜欢入选商品数":"2149","本月精选联盟发布≥5%佣金商品数":"0","本月累计千川消耗金额(元)":"0","机审驳回商品列表":"[]","机审驳回商品数量":"0","老店新开类型":"一证多开","自播商品曝光PV":"0","自播商品点击":"0","自播开播时长":"0","草稿箱中商品数量":"0","近14天直播带货时长(小时)":"0","近14天直播带货次数":"0","近30天GMV":"76元","近30天商品点击数":"0","近30天商品详情页展示数":"48","近30天支付订单数":"3","近30天支付订单金额":"76.16元","近30天直播带货时长(秒)":"0","近30天直播带货次数":"0","近30天累计千川消耗金额(元)":"0","近30日-好评率大于等于85%的商品数量":"0","近30日-好评率小于85%的商品数量":"2988","近7天商品曝光次数":"2124","近7天商品点击数":"39","近7天商品详情页展示数":"48","近7天支付订单数":"3","近7天支付订单金额":"76.16元","近7天日均开播时长":"0.00","近7天直播带货时长(小时)":"0","近7天直播带货时长(秒)":"0","近7天直播带货次数":"0","近7天累计千川消耗金额(元)":"0","近7日浏览发品类目填写页面":"0","近7日浏览发品结果页面":"0","近7日浏览发品表单填写页面":"0","近7日直播商品曝光点击率":"0.00%","近7日直播平均单小时曝光人数":"0.00","近90日信息质量分良好的商品数量":"2384","近一日全部猜喜入池商品数":"1468","近一日全部精选联盟上架商品数":"0","退店状态":"-","首次发品审核通过日期":"2026-03-24","首次正常营业距当前天数":"6","首次缴纳作者保证金日期":"","首次访问发品页日期":""}

### 商家数据补充


### 对话数据
[{"会话渠道":"外呼","常问问题":[]},{"会话渠道":"微信IM","常问问题":[]},{"会话渠道":"抖店IM","常问问题":[]}]

### 优秀同行数据
{"是否开通巨量千川":"是","是否开通精选联盟":"是","本月上架新商品数":"39","本月优化标题商品数":"1","本月发布挂车短视频数":"1","本月合作出单达人数":"1","本月挂购物车直播时长(小时)":"8","本月猜你喜欢入选商品数":"7","本月精选联盟发布≥5%佣金商品数":"1"}

### 经验参考
目标: 持续动销，商家在该目标下常遇到的卡点: ["如果存在不是旗舰店、官方旗舰店、专卖店、专营店的商家在架商品数小于10的情况，说明商家存在在架商品数过少的问题","如果存在在架商品数大于0，且所有商品信息质量分＞60，且销量＜10，且未设置营销工具的情况，说明商家存在未设置营销工具导致商品流量少的问题","如果存在动销商品数≥2，且商品好评率≥85%的商品数＜2，在架商品数≥10，说明商家存在商品好评率过低导致商品流量少的问题","如果存在商品好评率≥85%的商品数＜2，30天内支付订单数＜15的情况，说明商家存在商品出单过少的问题","如果存在商家在架商品数大于等于10，近30天支付订单≥15单且存在5个以上待优化商品数，有商品信息质量分＜60的情况，说明商家存在商品信息质量分过低导致商品流量少的问题","如果存在商家在架商品数大于等于10，近30天支付订单≥15单且存在10个以上待优化商品数，说明商家存在有商品信息待优化导致商品流量少的问题","如果存在商家在架商品数大于等于10，且近30天订单数大于30单，且未开通运费险的情况，说明商家存在未开通运费险的问题","如果存在商家在架商品数大于等于10，直播时长等于0且为绑定官方账号情况，说明商家存在未绑定官方账号导致无法直播的问题","如果存在商家的在架商品数大于等于10,近30天商品点击小于100,订单数小于10,说明商家存在商品曝光的问题","如果商家存在7天猜喜商品数小于2，近7天采纳的SEO优化商品数小于2，本月优化标题商品数小于2，说明商家存在商品待优化的问题","如果存在商家的在架商品数大于等于10，且商品优化完成后；未开通巨量千川，且有待使用权益","[\\\"千川-千川立减红包\\\"]，说明商家存在投流力度不足的问题"]

### 知识参考

`;

export default function LLMDebugDrawer({
  isOpen,
  onClose,
  systemPrompt,
  userPrompt,
}: LLMDebugDrawerProps) {
  const [systemContent, setSystemContent] = useState(systemPrompt || DEFAULT_SYSTEM_PROMPT);
  const [userContent, setUserContent] = useState(userPrompt || DEFAULT_USER_PROMPT);
  const [assistantOutput, setAssistantOutput] = useState(MOCK_ASSISTANT_OUTPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [useMock, setUseMock] = useState(true);
  const outputRef = useRef<HTMLDivElement>(null);

  // 当组件打开时，如果有传入的 userPrompt，更新它
  useEffect(() => {
    if (userPrompt) {
      setUserContent(userPrompt);
    }
  }, [userPrompt]);

  // 滚动到底部
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [assistantOutput]);

  const handleSend = async () => {
    setIsLoading(true);
    setAssistantOutput('');

    if (useMock) {
      // 使用 Mock 数据
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAssistantOutput(MOCK_ASSISTANT_OUTPUT);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/llm-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: systemContent,
          userPrompt: userContent,
        }),
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setAssistantOutput(prev => prev + decoder.decode(value));
        }
      }
    } catch (error) {
      console.error('LLM 调用失败:', error);
      setAssistantOutput('错误：LLM 调用失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(assistantOutput);
      alert('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleReset = () => {
    setSystemContent(DEFAULT_SYSTEM_PROMPT);
    setUserContent(DEFAULT_USER_PROMPT);
    setAssistantOutput(MOCK_ASSISTANT_OUTPUT);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={e => e.stopPropagation()}>
        {/* 抽屉头部 */}
        <div className={styles.drawerHeader}>
          <h3 className={styles.drawerTitle}>LLM 节点调试</h3>
          <div className={styles.drawerActions}>
            <label className={styles.mockToggle}>
              <input
                type="checkbox"
                checked={useMock}
                onChange={e => setUseMock(e.target.checked)}
              />
              <span>使用 Mock 数据</span>
            </label>
            <button className={styles.closeBtn} onClick={onClose}>×</button>
          </div>
        </div>

        {/* 抽屉内容 */}
        <div className={styles.drawerContent}>
          {/* System Prompt */}
          <div className={styles.promptSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>System</span>
            </div>
            <textarea
              className={styles.promptTextarea}
              value={systemContent}
              onChange={e => setSystemContent(e.target.value)}
              placeholder="输入 System Prompt..."
              rows={10}
            />
          </div>

          {/* User Prompt */}
          <div className={styles.promptSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>User</span>
            </div>
            <textarea
              className={styles.promptTextarea}
              value={userContent}
              onChange={e => setUserContent(e.target.value)}
              placeholder="输入 User Prompt..."
              rows={12}
            />
          </div>

          {/* Assistant Output */}
          <div className={styles.promptSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Assistant</span>
              <button
                className={styles.copyBtn}
                onClick={handleCopy}
                disabled={!assistantOutput}
              >
                复制
              </button>
            </div>
            <div
              ref={outputRef}
              className={styles.outputArea}
            >
              {isLoading && <span className={styles.loading}>思考中...</span>}
              {assistantOutput || (isLoading ? '' : '点击「发送」获取结果')}
            </div>
          </div>
        </div>

        {/* 抽屉底部 */}
        <div className={styles.drawerFooter}>
          <button className={styles.resetBtn} onClick={handleReset}>
            重置
          </button>
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? '发送中...' : '发送'}
          </button>
        </div>
      </div>
    </div>
  );
}
