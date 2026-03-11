import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '프롬프트를 입력해주세요.' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'AI API 키가 설정되지 않았습니다.' }, { status: 500 })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `당신은 기독교 공동체 블로그 작가입니다. 아래 주제로 블로그 글을 작성해주세요.

주제: ${prompt}

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "title": "블로그 제목",
  "excerpt": "2-3문장의 요약",
  "content": "본문 내용 (마크다운 형식, 최소 500자)"
}`
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Anthropic API error:', errorData)
      return NextResponse.json({ error: 'AI 생성 중 오류가 발생했습니다.' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

    // JSON 파싱 시도
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          title: parsed.title || '제목 없음',
          excerpt: parsed.excerpt || '',
          content: parsed.content || text,
        })
      }
    } catch {
      // JSON 파싱 실패 시 전체 텍스트를 content로
    }

    return NextResponse.json({
      title: `${prompt}`,
      excerpt: '',
      content: text,
    })
  } catch (error: any) {
    console.error('Generate blog error:', error)
    return NextResponse.json({ error: error.message || '서버 오류' }, { status: 500 })
  }
}
