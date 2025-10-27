import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space,
  Progress,
  Tag,
  Spin,
  Card,
  List,
  Avatar,
  Statistic
} from 'antd';
import {
  ArrowRightOutlined,
  FireOutlined,
  BookOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { useCategories } from '../hooks/useCategories';
import { useUserStatistics, useUserRank } from '../hooks/useStatistics';
import { useDataServicePracticeHistory, useSampleQuestions } from '../hooks/useQuestions';

const { Title, Text } = Typography;

export default function Home() {
  const { user } = useAuth();
  
  // Use custom hooks for data fetching
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: practiceHistory = [], isLoading: historyLoading } = useDataServicePracticeHistory();
  const { data: userStats, isLoading: statsLoading } = useUserStatistics();
  const { data: userRank } = useUserRank();
  
  // Get sample questions from first category
  const firstCategory = (categories as any[])[0];
  const { data: sampleSession, isLoading: sampleLoading } = useSampleQuestions(firstCategory?.id || '');
  
  const recentQuestions = (sampleSession as any)?.questions?.slice(0, 5) || [];
  
  const loading = categoriesLoading || historyLoading || statsLoading;

  const stats = userStats ? [
    { label: 'Questions Solved', value: userStats.totalQuestionsAttempted || '0', color: '#3b82f6' },
    { label: 'Accuracy', value: `${Math.round(parseFloat(userStats.overallAccuracy || '0'))}%`, color: '#10b981' },
    { label: 'Time Spent', value: `${userStats.totalTimeSpentMinutes || '0'}min`, color: '#f59e0b' },
    { label: 'Current Streak', value: `${userStats.currentStreak || '0'} days`, color: '#8b5cf6' },
  ] : [
    { label: 'Questions Solved', value: '0', color: '#3b82f6' },
    { label: 'Accuracy', value: '0%', color: '#10b981' },
    { label: 'Time Spent', value: '0min', color: '#f59e0b' },
    { label: 'Current Streak', value: '0 days', color: '#8b5cf6' },
  ];

  const recentSessions = ((practiceHistory as any[]) || [])
    .sort((a: any, b: any) => {
      // Sort by completedAt date (most recent first)
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3)
    .map((session: any, index: number) => ({
      rank: index + 1,
      subject: session.category || 'Unknown',
      score: Math.round(session.accuracy || 0),
      time: `${session.durationMinutes || 0} min`,
      date: session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'Unknown',
      sessionId: session.sessionId
    }));

  const progressData = [
    { subject: 'Economy', progress: 75, color: '#3b82f6' },
    { subject: 'General Knowledge', progress: 60, color: '#10b981' },
    { subject: 'History', progress: 45, color: '#f59e0b' },
    { subject: 'Geography', progress: 30, color: '#8b5cf6' },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: '48px' }}>
          <Title level={1} style={{ 
            margin: '0 0 8px 0', 
            fontSize: '32px',
            fontWeight: '800',
            color: '#1f2937'
          }}>
            Welcome back, {user?.fullName?.split(' ')[0]}! 👋
            {userRank && typeof userRank === 'object' && userRank.rank ? (
              <Tag color="gold" style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                Rank #{userRank.rank}
              </Tag>
            ) : userRank && typeof userRank === 'number' ? (
              <Tag color="gold" style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                Rank #{userRank}
              </Tag>
            ) : userStats && userStats.rankingPoints > 0 ? (
              <Tag color="blue" style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                {userStats.rankingPoints} pts
              </Tag>
            ) : null}
          </Title>
          <Text style={{ 
            fontSize: '16px', 
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Ready to continue your learning journey?
          </Text>
          <div style={{ marginTop: '24px' }}>
            <Space size="middle">
              <Link to="/practice">
                <Button 
                  type="primary" 
                  size="large"
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    background: '#6366f1',
                    border: 'none'
                  }}
                >
                  Start Practice <ArrowRightOutlined />
                </Button>
              </Link>
              <Link to="/exams">
                <Button 
                  size="large"
                  style={{
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '15px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    border: '2px solid #e5e7eb',
                    color: '#1f2937'
                  }}
                >
                  Take Exam
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        {/* Stats Row */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {stats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <div style={{
                padding: '24px',
                borderRadius: '12px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease'
              }}>
                <Text style={{ 
                  fontSize: '13px', 
                  color: '#6b7280',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </Text>
                <div style={{ 
                  fontSize: '28px', 
                  fontWeight: '800',
                  color: stat.color,
                  marginTop: '8px'
                }}>
                  {stat.value}
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Practice Categories */}
        <div style={{ marginBottom: '48px' }}>
          <Title level={2} style={{ 
            margin: '0 0 24px 0',
            fontSize: '24px',
            fontWeight: '800',
            color: '#1f2937'
          }}>
            Practice Categories
          </Title>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <Spin size="large" />
              <div style={{ marginTop: '16px', color: '#6b7280' }}>
                Loading categories...
              </div>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {(categories as any[]).map((category: any) => (
                <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
                  <Link to="/practice">
                    <div style={{
                      padding: '24px',
                      borderRadius: '12px',
                      background: '#ffffff',
                      border: '2px solid #f3f4f6',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      height: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = category.color;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                      <div style={{ 
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: category.color,
                        marginBottom: '16px'
                      }} />
                      <Title level={4} style={{ 
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {category.name}
                      </Title>
                      <Text style={{ 
                        fontSize: '13px',
                        color: '#6b7280',
                        fontWeight: '500',
                        display: 'block',
                        marginBottom: '4px'
                      }}>
                        {category.questionCount} questions
                      </Text>
                      <Text style={{ 
                        fontSize: '12px',
                        color: '#9ca3af',
                        fontWeight: '400'
                      }}>
                        {category.description}
                      </Text>
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Recent Questions Section */}
        {recentQuestions.length > 0 && recentQuestions.every((q: any) => q && typeof q === 'object') && (
          <div style={{ marginBottom: '48px' }}>
            <Title level={2} style={{ 
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: '800',
              color: '#1f2937'
            }}>
              Recent Questions
            </Title>
            <Card style={{ borderRadius: '12px' }}>
              <List
                dataSource={recentQuestions}
                renderItem={(question: any, index: number) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: '#FF7846',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      }
                      title={
                        <Text strong style={{ fontSize: '16px' }}>
                          {question.questionText || 'Question not available'}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Space wrap>
                            {question.options?.map((option: any, optIndex: number) => (
                              <Tag key={optIndex} color="blue">
                                {typeof option === 'string' ? option : (option?.text || option)}
                              </Tag>
                            ))}
                          </Space>
                          <Space>
                            <Text type="secondary">Correct Answer: </Text>
                            <Text strong style={{ color: '#52c41a' }}>
                              {question.correctAnswer || 'Not available'}
                            </Text>
                          </Space>
                          <Space>
                            <Text type="secondary">Category: </Text>
                            <Tag color="orange">{question.category || 'Unknown'}</Tag>
                            <Text type="secondary">Difficulty: </Text>
                            <Tag color="purple">{question.difficulty || 'Unknown'}</Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}

        {/* Recent Activity & Progress */}
        <Row gutter={[24, 24]}>
          {/* Recent Practice Sessions */}
          <Col xs={24} lg={12}>
            <Title level={2} style={{ 
              margin: '0 0 24px 0',
              fontSize: '24px',
              fontWeight: '800',
              color: '#1f2937'
            }}>
              Recent Sessions
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {recentSessions.map((session: any, index: number) => (
                <div key={session.sessionId || index} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  position: 'relative'
                }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: session.rank === 1 ? '#fbbf24' : session.rank === 2 ? '#9ca3af' : '#6b7280',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {session.rank}
                        </div>
                        <div>
                          <Text style={{ 
                            fontSize: '15px',
                            fontWeight: '700',
                            color: '#1f2937',
                            display: 'block',
                            marginBottom: '4px'
                          }}>
                            {session.subject}
                          </Text>
                          <Text style={{ 
                            fontSize: '13px',
                            color: '#6b7280',
                            fontWeight: '500'
                          }}>
                            {session.time} • {session.date}
                          </Text>
                        </div>
                      </div>
                    </Col>
                    <Col>
                      <Tag 
                        style={{
                          background: '#dcfce7',
                          color: '#166534',
                          border: 'none',
                          fontWeight: '700',
                          fontSize: '14px',
                          padding: '4px 12px',
                          borderRadius: '6px'
                        }}
                      >
                        {session.score}%
                      </Tag>
                    </Col>
                  </Row>
                </div>
              ))}
            </Space>
          </Col>
          
          {/* Progress Overview */}
          <Col xs={24} lg={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Title level={2} style={{ 
                margin: 0,
                fontSize: '24px',
                fontWeight: '800',
                color: '#1f2937'
              }}>
                Progress Overview
              </Title>
              <FireOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {progressData.map((item, index) => (
                <div key={index}>
                  <Row justify="space-between" style={{ marginBottom: '12px' }}>
                    <Col>
                      <Text style={{ 
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#1f2937'
                      }}>
                        {item.subject}
                      </Text>
                    </Col>
                    <Col>
                      <Text style={{ 
                        fontSize: '14px',
                        fontWeight: '700',
                        color: item.color
                      }}>
                        {item.progress}%
                      </Text>
                    </Col>
                  </Row>
                  <Progress 
                    percent={item.progress} 
                    strokeColor={item.color}
                    showInfo={false}
                    strokeWidth={8}
                    trailColor="#f3f4f6"
                  />
                </div>
              ))}
            </Space>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}