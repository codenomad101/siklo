import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Table,
  Space,
  Tag,
  Avatar,
  Badge,
  Progress,
  Statistic,
  Timeline,
  List
} from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';
import { useCategories } from '../hooks/useCategories';
import { useExamHistory } from '../hooks/useExams';

const { Title, Text, Paragraph } = Typography;

export default function Exams() {
  const navigate = useNavigate();
  
  // Use custom hooks
  const { data: categories = [] } = useCategories();
  const { data: examHistoryData = [], isLoading: historyLoading } = useExamHistory();
  
  const examHistory = examHistoryData || [];

  const handleCreateExam = async () => {
    // Navigate to practice page with exam mode
    navigate('/practice?mode=exam');
  };

  const columns = [
    {
      title: 'Exam',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #FF7846, #722ed1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}
          >
            <FileTextOutlined />
          </div>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.category}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'marks',
      key: 'score',
      render: (marks, record) => (
        <div>
          <Text strong>{marks}/{record.totalMarks}</Text>
          <br />
          <Tag color={record.percentage >= 80 ? 'green' : record.percentage >= 60 ? 'orange' : 'red'}>
            {record.percentage}%
          </Tag>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <Space>
          <ClockCircleOutlined />
          <Text>{duration} min</Text>
        </Space>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text>{date}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'blue'}>
          {status === 'completed' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" icon={<EyeOutlined />}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ padding: '32px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Quick Actions */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card 
              hoverable
              style={{ borderRadius: '12px', textAlign: 'center' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ fontSize: '48px', color: '#FF7846', marginBottom: '16px' }}>
                <PlusOutlined />
              </div>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>
                Create New Exam
              </Title>
              <Paragraph style={{ color: '#666', margin: '0 0 16px 0' }}>
                Start a custom dynamic exam
              </Paragraph>
              <Button 
                type="primary" 
                size="large" 
                block
                onClick={handleCreateExam}
              >
                Create Exam
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card 
              hoverable
              style={{ borderRadius: '12px', textAlign: 'center' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }}>
                <TrophyOutlined />
              </div>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>
                Statistics
              </Title>
              <Paragraph style={{ color: '#666', margin: '0 0 16px 0' }}>
                View your exam performance
              </Paragraph>
              <Button size="large" block>View Stats</Button>
            </Card>
          </Col>

          <Col xs={24} sm={8}>
            <Card 
              hoverable
              style={{ borderRadius: '12px', textAlign: 'center' }}
              bodyStyle={{ padding: '24px' }}
            >
              <div style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }}>
                <BarChartOutlined />
              </div>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>
                Analytics
              </Title>
              <Paragraph style={{ color: '#666', margin: '0 0 16px 0' }}>
                Detailed performance insights
              </Paragraph>
              <Button size="large" block>View Analytics</Button>
            </Card>
          </Col>
        </Row>

        {/* Performance Summary */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Exams"
                value={examHistory.length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#FF7846' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Average Score"
                value={79.2}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Time"
                value={60}
                suffix="min"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Best Score"
                value={87.5}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Exam History */}
        <Card title="Recent Exams" style={{ borderRadius: '12px' }}>
          <Table 
            columns={columns} 
            dataSource={examHistory} 
            pagination={false}
            rowKey="id"
          />
        </Card>

        {/* Performance Timeline */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Performance Trend" style={{ borderRadius: '12px' }}>
              <Timeline>
                <Timeline.Item color="green">
                  <Text strong>Quick Test - 87.5%</Text>
                  <br />
                  <Text type="secondary">Oct 14, 2024</Text>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Text strong>Practice Exam - 70%</Text>
                  <br />
                  <Text type="secondary">Oct 13, 2024</Text>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text strong>History Test - 80%</Text>
                  <br />
                  <Text type="secondary">Oct 12, 2024</Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Subject Performance" style={{ borderRadius: '12px' }}>
              <List
                dataSource={[
                  { subject: 'Economy', score: 85, color: '#FF7846' },
                  { subject: 'History', score: 80, color: '#fa8c16' },
                  { subject: 'Geography', score: 75, color: '#722ed1' },
                  { subject: 'General Knowledge', score: 70, color: '#52c41a' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <Row justify="space-between" style={{ marginBottom: '8px' }}>
                        <Col>
                          <Text>{item.subject}</Text>
                        </Col>
                        <Col>
                          <Text type="secondary">{item.score}%</Text>
                        </Col>
                      </Row>
                      <Progress 
                        percent={item.score} 
                        strokeColor={item.color}
                        showInfo={false}
                        size="small"
                      />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}