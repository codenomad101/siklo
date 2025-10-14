import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space,
  Progress,
  Tag
} from 'antd';
import {
  ArrowRightOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from '../components/AppLayout';

const { Title, Text } = Typography;

export default function Home() {
  const { user } = useAuth();
  
  const categories = [
    { id: 'economy', name: 'Economy', color: '#3b82f6', questions: 200 },
    { id: 'gk', name: 'General Knowledge', color: '#10b981', questions: 300 },
    { id: 'history', name: 'History', color: '#f59e0b', questions: 250 },
    { id: 'geography', name: 'Geography', color: '#8b5cf6', questions: 180 },
    { id: 'english', name: 'English', color: '#ec4899', questions: 220 },
    { id: 'aptitude', name: 'Aptitude', color: '#06b6d4', questions: 280 },
    { id: 'agriculture', name: 'Agriculture', color: '#84cc16', questions: 150 },
    { id: 'marathi', name: 'Marathi', color: '#f97316', questions: 120 },
  ];

  const stats = [
    { label: 'Questions Solved', value: '1,128', color: '#3b82f6' },
    { label: 'Accuracy', value: '87.5%', color: '#10b981' },
    { label: 'Time Spent', value: '45hrs', color: '#f59e0b' },
    { label: 'Current Streak', value: '12 days', color: '#8b5cf6' },
  ];

  const recentSessions = [
    { subject: 'Economy', score: 85, time: '15 min', date: 'Today' },
    { subject: 'General Knowledge', score: 92, time: '12 min', date: 'Yesterday' },
    { subject: 'History', score: 78, time: '18 min', date: '2 days ago' },
  ];

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
          <Row gutter={[16, 16]}>
            {categories.map((category) => (
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
                      fontWeight: '500'
                    }}>
                      {category.questions} questions
                    </Text>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </div>

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
              {recentSessions.map((session, index) => (
                <div key={index} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb'
                }}>
                  <Row justify="space-between" align="middle">
                    <Col>
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