'use client'

import React from 'react'
import { YStack, XStack, ScrollView, H2, H3, H4, Paragraph, SizableText } from '@my/ui'
import { Music, Code, Globe, ChevronDown, Zap, BookOpen, Wifi, Users } from '@tamagui/lucide-icons'

export function LandingScreen() {
    return (
        <ScrollView flex={1} bg="$backgroundBody">
            <YStack maxWidth={960} alignSelf="center" width="100%" px="$4" py="$8" gap="$10">

                {/* Hero Letter - M3 Elevated Card */}
                <YStack bg="$surface" borderRadius="$xl" borderWidth={1} borderColor="$outlineVariant" overflow="hidden">
                    {/* Accent top bar */}
                    <YStack height={4} bg="$primary" />
                    <YStack p="$7" gap="$6">
                        <YStack gap="$2">
                            <H2 color="$onSurface" fontWeight="800" fontSize={28} lineHeight={38}>
                                광야를 지나온 노래,{'\n'}이제 당신의 길잡이가 됩니다.
                            </H2>
                            <SizableText color="$primary" size="$4" fontStyle="italic" fontWeight="500">
                                'I Believe in God even in the Digital Age'
                            </SizableText>
                        </YStack>

                        <YStack gap="$4">
                            <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                                평안하십니까? 팀 길잡이(Team Giljabi)의 백형근(David Back)입니다.
                            </Paragraph>
                            <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                                1988년, 뜨거운 가슴으로 찬양을 부르던 청년이 있었습니다.
                                하지만 하나님은 저를 화려한 무대가 아닌, 20년의 IT 생활이라는 긴 광야로 이끄셨습니다.
                                그곳에서 저는 차갑고 낯선 기술을 익히고, 디아스포라의 외로움을 견디며 사역의 쓰임새를 다시 묻게 되었습니다.
                            </Paragraph>
                            <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                                이곳에 머물며 깨닫습니다. 그 시간은 급변하는 디지털 세상 속에서 길 잃은 성도들을 안내하기 위한 훈련의 시간이었음을.
                            </Paragraph>
                            <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                                우리는 지금 AI와 알고리즘의 홍수 속에 살고 있습니다. 기술은 발전했지만, 영혼은 더 공허해지기 쉬운 시대입니다.
                                저의 '팀 길잡이'는 이 차가운 디지털 기술 뒤에 변치 않는 복음의 온기를 불어넣으려 합니다.
                            </Paragraph>
                            <YStack bg="$primaryContainer" p="$4" borderRadius="$lg">
                                <Paragraph color="$onPrimaryContainer" size="$4" lineHeight={28} fontWeight="600">
                                    광야 속에 남긴 말씀(Story)을 음악과 기술(Sound & Tech)로 짜임,
                                    AI, 디지털 시대를 살아가는 성도들의 영적 길잡이가 되겠습니다.
                                </Paragraph>
                            </YStack>
                            <Paragraph color="$onSurface" size="$4" lineHeight={28}>
                                가장 낮은 곳에서 배운 기술로, 가장 높은 분을 찬양하는 이 여정에 여러분을 초대합니다.
                            </Paragraph>
                        </YStack>

                        <YStack alignItems="flex-end" mt="$2" pt="$4" borderTopWidth={1} borderColor="$outlineVariant">
                            <SizableText color="$onSurface" fontWeight="700" size="$5">백형근 (David Back) 드림</SizableText>
                            <SizableText color="$onSurfaceVariant" size="$3" mt="$1">Team Giljabi 대표 / IT선교사</SizableText>
                        </YStack>
                    </YStack>
                </YStack>

                {/* WHY NOW Section */}
                <YStack alignItems="center" gap="$6">
                    <YStack alignItems="center" gap="$2">
                        <XStack bg="$primaryContainer" px="$4" py="$1.5" borderRadius="$full">
                            <SizableText color="$onPrimaryContainer" fontWeight="700" size="$2" letterSpacing={2}>WHY NOW?</SizableText>
                        </XStack>
                        <H3 color="$onSurface" mt="$2" textAlign="center" fontWeight="800" fontSize={24}>
                            시대의 물음에{'\n'}길잡이가 답합니다
                        </H3>
                    </YStack>

                    <XStack flexWrap="wrap" gap="$4" width="100%">
                        {[
                            {
                                icon: Zap,
                                pTitle: "AI의 맹점과 영적 공백",
                                pDesc: "AI는 정답을 주지만, 위로를 줄 수는 없습니다.",
                                aTitle: "기술 위에 입힌 따뜻한 영성",
                                aDesc: "우리는 차가운 디지털 기술 위에 복음의 온기를 불어넣습니다. AI 도구를 사용하되, 그 중심에는 변치 않는 십자가의 위로가 있습니다."
                            },
                            {
                                icon: BookOpen,
                                pTitle: "콘텐츠 홍수, 깊이의 부재",
                                pDesc: "자극적인 콘텐츠가 넘쳐나고 사용자가 사라진 시대.",
                                aTitle: "진정성 있는 서사(Story)와 울림",
                                aDesc: "일회성 에피소드가 아닌, 삶이 축적된 진짜 이야기를 노래합니다. 다니엘 오 작가의 깊은 텍스트가 미디어와 만나 영혼의 울림을 채웁니다."
                            },
                            {
                                icon: Wifi,
                                pTitle: "사역 현장의 기술적 소외",
                                pDesc: "작은 교회와 선교지는 디지털 전환에 뒤처지고 있습니다.",
                                aTitle: "디지털 텐트메이킹(Tentmaking)",
                                aDesc: "물고기를 주는 것을 넘어 잡는 법을 나눕니다. AI와 미디어 기술 전수를 통해 자립 가능한 선교 생태계를 구축합니다."
                            },
                            {
                                icon: Users,
                                pTitle: "세대와 문화의 단절",
                                pDesc: "기성세대와 다음세대의 대화가 끊기고 있습니다.",
                                aTitle: "시대를 잇는 '통각'의 모델",
                                aDesc: "선배의 연륜과 후배의 감각이 만났습니다. 수직적 위계를 넘어 수평적 연합으로, 더 깊은 사역자들과 함께하는 열린 플랫폼을 지향합니다."
                            }
                        ].map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <YStack key={idx} flex={1} minWidth={280} bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" overflow="hidden">
                                    {/* Problem */}
                                    <YStack p="$5" gap="$2" bg="$surfaceContainerLow">
                                        <XStack alignItems="center" gap="$2">
                                            <Icon size={16} color="$onSurfaceVariant" />
                                            <SizableText color="$onSurfaceVariant" size="$3" fontWeight="600">{item.pTitle}</SizableText>
                                        </XStack>
                                        <SizableText color="$onSurfaceVariant" size="$3" lineHeight={20}>{item.pDesc}</SizableText>
                                    </YStack>

                                    {/* Arrow */}
                                    <XStack justifyContent="center" my={-12} zIndex={1}>
                                        <XStack bg="$primary" width={28} height={28} borderRadius="$full" alignItems="center" justifyContent="center" borderWidth={1} borderColor="$outlineVariant">
                                            <ChevronDown size={16} color="white" />
                                        </XStack>
                                    </XStack>

                                    {/* Answer */}
                                    <YStack p="$5" gap="$2" pt="$6">
                                        <SizableText color="$onSurface" size="$5" fontWeight="700">{item.aTitle}</SizableText>
                                        <Paragraph color="$onSurface" size="$3" lineHeight={22}>{item.aDesc}</Paragraph>
                                    </YStack>
                                </YStack>
                            )
                        })}
                    </XStack>
                </YStack>

                {/* Domains Section - M3 Filled Cards */}
                <XStack flexWrap="wrap" gap="$4" width="100%">
                    {[
                        {
                            icon: Music,
                            title: "Worship & Media",
                            desc: "다니엘 오 작가의 인문학적 텍스트에 백형근 대표의 감성 미디어를 입힙니다. 단순한 찬양을 넘어, 메시지가 보이는 입체적인 예배 콘텐츠를 지향합니다.",
                            tags: ["#북콘서트", "#디지털앨범", "#워십미디어"],
                            color: '$primary'
                        },
                        {
                            icon: Code,
                            title: "Digital Tentmaker",
                            desc: "작은 교회와 선교지가 기술 소외를 겪지 않도록 돕습니다. AI 활용법과 미디어 기술 교육을 통해 사역자 자립(Passive Income) 생태계를 만듭니다.",
                            tags: ["#AI사역교육", "#미디어멘토링", "#자립지원"],
                            color: '$secondary'
                        },
                        {
                            icon: Globe,
                            title: "Global Connection",
                            desc: "한국과 미국, 그리고 열방을 잇습니다. 외로운 선교지의 생명력 있는 현장을 잇고, 후원자와 사역지를 연결하는 영적 플랫폼 역할을 감당합니다.",
                            tags: ["#선교지연결", "#온라인디지털선교", "#사역"],
                            color: '$tertiary'
                        }
                    ].map((item, idx) => {
                        const Icon = item.icon
                        return (
                            <YStack key={idx} flex={1} minWidth={280} bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" overflow="hidden">
                                {/* Icon Header */}
                                <YStack height={100} bg="$surfaceContainerHigh" alignItems="center" justifyContent="center">
                                    <XStack bg="$surfaceContainerLowest" width={56} height={56} borderRadius="$full" alignItems="center" justifyContent="center" borderWidth={1} borderColor="$outlineVariant">
                                        {/* @ts-ignore 커스텀 토큰 색상 */}
                                        <Icon size={28} color={item.color} />
                                    </XStack>
                                </YStack>

                                <YStack p="$5" gap="$3" flex={1}>
                                    <H4 color="$onSurface" fontWeight="700">{item.title}</H4>
                                    <Paragraph color="$onSurfaceVariant" size="$3" lineHeight={22} flex={1}>
                                        {item.desc}
                                    </Paragraph>
                                    <XStack flexWrap="wrap" gap="$2" mt="$1">
                                        {item.tags.map((tag, ti) => (
                                            <SizableText
                                                key={ti}
                                                bg="$surfaceContainerLow"
                                                color="$onSurfaceVariant"
                                                px="$2.5"
                                                py="$1"
                                                borderRadius="$full"
                                                size="$2"
                                                fontWeight="500"
                                            >
                                                {tag}
                                            </SizableText>
                                        ))}
                                    </XStack>
                                </YStack>
                            </YStack>
                        )
                    })}
                </XStack>

                {/* Team Intro Section */}
                <YStack alignItems="center" gap="$5" mt="$4">
                    <XStack bg="$primaryContainer" px="$4" py="$1.5" borderRadius="$full">
                        <SizableText color="$onPrimaryContainer" fontWeight="700" size="$2" letterSpacing={2}>사역팀 소개</SizableText>
                    </XStack>

                    <YStack width="100%" maxWidth={600} bg="$surface" borderRadius="$card" borderWidth={1} borderColor="$outlineVariant" overflow="hidden">
                        <YStack height={4} bg="$primary" />
                        <YStack p="$6" gap="$4">
                            <H4 color="$onSurface" fontWeight="700">Book Concert Team</H4>
                            <SizableText color="$onSurfaceVariant" size="$3">다니엘 오 작가 사역 지원 및 북콘서트 기획 그룹</SizableText>

                            <YStack bg="$primaryContainer" p="$4" borderRadius="$lg">
                                <Paragraph color="$onPrimaryContainer" size="$3" fontWeight="600" lineHeight={22}>
                                    "활자(Story)가 소리(Sound)를 입는 순간을 준비합니다."
                                </Paragraph>
                            </YStack>

                            <Paragraph color="$onSurface" size="$3" lineHeight={22}>
                                이곳은 다니엘 오 작가의 깊이 있는 텍스트가 미디어와 만나 입체적인 '문화 예배'로 완성되는 과정을 함께 만드는 스태프 공간입니다.
                            </Paragraph>

                            <YStack gap="$3" bg="$surfaceContainerLow" p="$4" borderRadius="$lg">
                                <SizableText color="$onSurface" size="$3" fontWeight="700">주요 활동 분야</SizableText>
                                {[
                                    "Planning : 저자와 만남 등 북콘서트 및 집회 기획",
                                    "Tech & Media : 무대 연출, 음향, 영상 기술 지원",
                                    "Operation : 현장 운영, 홍보 마케팅, 지원"
                                ].map((text, i) => (
                                    <XStack key={i} gap="$2" alignItems="flex-start">
                                        <SizableText color="$primary" fontWeight="700" mt={1}>•</SizableText>
                                        <SizableText color="$onSurface" size="$3" lineHeight={20}>{text}</SizableText>
                                    </XStack>
                                ))}
                            </YStack>
                        </YStack>
                    </YStack>
                </YStack>

                {/* Footer */}
                <YStack alignItems="center" py="$6">
                    <SizableText size="$2" color="$onSurfaceVariant">
                        © 2026 - Giljabi.com
                    </SizableText>
                </YStack>
            </YStack>
        </ScrollView>
    )
}
