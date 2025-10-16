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
  List,
  Modal,
  Result,
  Divider
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
  BarChartOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';
import { useCategories } from '../hooks/useCategories';
import { useExamHistory, useResumeExam } from '../hooks/useExams';

const { Title, Text, Paragraph } = Typography;

export default function Exams() {
  const navigate = useNavigate();
  
  // Use custom hooks
  const { data: categories = [] } = useCategories();
  const { data: examHistoryData = [], isLoading: historyLoading } = useExamHistory();
  const resumeExamMutation = useResumeExam();
  
  const examHistory = examHistoryData || [];
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedExamResults, setSelectedExamResults] = useState<any>(null);

  const handleCreateExam = async () => {
    // Navigate to practice page with exam mode
    navigate('/practice?mode=exam');
  };

  const handleResumeExam = async (sessionId: string) => {
    try {
      const examData = await resumeExamMutation.mutateAsync(sessionId);
      // Navigate to exam page with the session ID
      navigate(`/exam/${sessionId}`);
    } catch (error) {
      console.error('Error resuming exam:', error);
    }
  };

  const handleViewExam = (sessionId: string, status: string) => {
    if (status === 'completed') {
      // Find the exam data and show results modal
      const exam = examHistory.find(e => e.sessionId === sessionId);
      if (exam) {
        setSelectedExamResults(exam);
        setShowResultsModal(true);
      }
    } else {
      // Resume the exam
      handleResumeExam(sessionId);
    }
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
      render: (status, record) => {
        const completionPercentage = record.completionPercentage || 0;
        const isCompleted = status === 'completed';
        const isInProgress = status === 'in_progress';
        
        return (
          <div>
            <Tag color={isCompleted ? 'green' : isInProgress ? 'blue' : 'orange'}>
              {isCompleted ? <CheckCircleOutlined /> : isInProgress ? <ClockCircleOutlined /> : <PlayCircleOutlined />}
              {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
            </Tag>
            {!isCompleted && (
              <div style={{ marginTop: '4px' }}>
                <Progress 
                  percent={completionPercentage} 
                  size="small" 
                  showInfo={false}
                  strokeColor="#1890ff"
                />
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {completionPercentage}% complete
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const isCompleted = record.status === 'completed';
        const isResumable = record.status === 'in_progress' || record.status === 'not_started';
        
        return (
          <Space>
            {isResumable && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleResumeExam(record.sessionId)}
                loading={resumeExamMutation.isPending}
              >
                {record.status === 'in_progress' ? 'Resume' : 'Start'}
              </Button>
            )}
            {isCompleted && (
              <Button 
                type="link" 
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewExam(record.sessionId, record.status)}
              >
                View Results
              </Button>
            )}
          </Space>
        );
      },
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
            rowKey="sessionId"
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

      {/* Exam Results Modal */}
      <Modal
        title="Exam Results"
        open={showResultsModal}
        onCancel={() => setShowResultsModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowResultsModal(false)}>
            Close
          </Button>
        ]}
        width={800}
        centered
      >
        {selectedExamResults && (
          <div>
            <Result
              status={selectedExamResults.percentage >= 60 ? "success" : "warning"}
              title={`${selectedExamResults.examName || selectedExamResults.name} - Completed!`}
              subTitle={`You scored ${selectedExamResults.percentage}% (${selectedExamResults.marksObtained}/${selectedExamResults.totalMarks} marks)`}
            />
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Questions Attempted"
                    value={selectedExamResults.questionsAttempted || 0}
                    suffix={`/ ${(selectedExamResults.questionsAttempted || 0) + (selectedExamResults.skippedQuestions || 0)}`}
                    prefix={<QuestionCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Correct Answers"
                    value={selectedExamResults.correctAnswers || 0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Incorrect Answers"
                    value={selectedExamResults.incorrectAnswers || 0}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Skipped Questions"
                    value={selectedExamResults.skippedQuestions || 0}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Time Spent"
                    value={Math.floor((selectedExamResults.timeSpentSeconds || 0) / 60)}
                    suffix={`min ${(selectedExamResults.timeSpentSeconds || 0) % 60}s`}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Duration"
                    value={selectedExamResults.durationMinutes || selectedExamResults.duration || 0}
                    suffix="min"
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#13c2c2' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Progress
                type="circle"
                percent={selectedExamResults.percentage || 0}
                strokeColor={(selectedExamResults.percentage || 0) >= 80 ? '#52c41a' : (selectedExamResults.percentage || 0) >= 60 ? '#faad14' : '#ff4d4f'}
                size={120}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ fontSize: '18px' }}>
                  {(selectedExamResults.percentage || 0) >= 80 ? 'Excellent!' : 
                   (selectedExamResults.percentage || 0) >= 60 ? 'Good Job!' : 
                   'Keep Practicing!'}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}