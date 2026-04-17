// LLM 节点调试 API 路由
import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: "缺少用户输入" },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: "system" as const, content: systemPrompt || "" },
      { role: "user" as const, content: userPrompt },
    ];

    // 使用流式输出
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            model: "doubao-seed-2-0-pro-260215",
            temperature: 0.7,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(chunk.content.toString()));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("LLM Debug API Error:", error);
    return NextResponse.json(
      { error: "LLM 调用失败" },
      { status: 500 }
    );
  }
}
