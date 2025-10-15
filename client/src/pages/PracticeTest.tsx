import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Radio, 
  Space, 
  Progress, 
  Row, 
  Col,
  Statistic,
  Divider,
  Alert
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';
import { dataService, Question } from '../services/dataService';

const { Title, Text, Paragraph } = Typography;

interface TestResult {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

interface PracticeSession {
  sessionId: string;
  questions: Question[];
  category: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  status: string;
}

const PracticeTestPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const currentQuestion = session?.questions[currentQuestionIndex];
  const totalQuestions = session?.totalQuestions || 20;
  const timePerQuestion = 45; // 45 seconds per question (15 minutes / 20 questions)

  useEffect(() => {
    const initializeSession = async () => {
      if (!categoryId) {
        setError('Category not found');
        setLoading(false);
        return;
      }

      try {
        // Create a new practice session via backend
        const sessionData = await dataService.createPracticeSession(categoryId, 15);
        setSession(sessionData);
      } catch (err) {
        setError('Failed to create practice session');
        console.error('Error creating practice session:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [categoryId]);

  useEffect(() => {
    if (timeLeft <= 0 && !testCompleted) {
      handleTestComplete();
    }
  }, [timeLeft, testCompleted]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !selectedAnswer || !session) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = timePerQuestion - (timeLeft % timePerQuestion);
    
    const result: TestResult = {
      question: currentQuestion,
      selectedAnswer,
      isCorrect,
      timeSpent
    };

    setTestResults(prev => [...prev, result]);

    try {
      // Update the answer in the backend
      await dataService.updatePracticeAnswer(
        session.sessionId,
        currentQuestion.questionId,
        selectedAnswer,
        timeSpent
      );
    } catch (error) {
      console.error('Error updating practice answer:', error);
    }

    if (currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      handleTestComplete();
    }
  };

  const handleTestComplete = async () => {
    if (currentQuestion && selectedAnswer && session) {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const timeSpent = timePerQuestion - (timeLeft % timePerQuestion);
      
      const result: TestResult = {
        question: currentQuestion,
        selectedAnswer,
        isCorrect,
        timeSpent
      };
      setTestResults(prev => [...prev, result]);

      try {
        // Update the final answer in the backend
        await dataService.updatePracticeAnswer(
          session.sessionId,
          currentQuestion.questionId,
          selectedAnswer,
          timeSpent
        );

        // Complete the practice session
        await dataService.completePracticeSession(session.sessionId);
      } catch (error) {
        console.error('Error completing practice session:', error);
      }
    }
    setTestCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    const correct = testResults.filter(result => result.isCorrect).length;
    return Math.round((correct / testResults.length) * 100);
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <Title level={2}>Creating Practice Session...</Title>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <Alert message={error} type="error" />
          <Button 
            type="primary" 
            onClick={() => navigate('/practice')}
            style={{ marginTop: '16px' }}
          >
            Back to Practice
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (testCompleted) {
    const score = getScore();
    const correctAnswers = testResults.filter(result => result.isCorrect).length;
    const totalAnswered = testResults.length;

    return (
      <AppLayout>
        <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/practice')}
              style={{ marginBottom: '24px' }}
            >
              Back to Practice
            </Button>
            <Title level={1} style={{ textAlign: 'center', marginBottom: '8px' }}>
              <TrophyOutlined style={{ color: '#f59e0b', marginRight: '12px' }} />
              Test Completed!
            </Title>
            <Text style={{ textAlign: 'center', display: 'block', fontSize: '16px', color: '#6b7280' }}>
              Here are your results and explanations
            </Text>
          </div>

          {/* Score Summary */}
          <Card style={{ marginBottom: '32px', textAlign: 'center' }}>
            <Row gutter={24}>
              <Col span={8}>
                <Statistic 
                  title="Score" 
                  value={score} 
                  suffix="%" 
                  valueStyle={{ color: score >= 70 ? '#52c41a' : score >= 50 ? '#faad14' : '#ff4d4f' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Correct Answers" 
                  value={correctAnswers} 
                  suffix={`/ ${totalAnswered}`}
                  valueStyle={{ color: '#FF7846' }}
                />
              </Col>
              <Col span={8}>
                <Statistic 
                  title="Time Used" 
                  value={formatTime(15 * 60 - timeLeft)}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Question Results */}
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>Question Review</Title>
            {testResults.map((result, index) => (
              <Card key={index} style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    Question {index + 1}: {result.question.questionText}
                  </Text>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Your Answer: </Text>
                  <Text style={{ 
                    color: result.isCorrect ? '#52c41a' : '#ff4d4f',
                    fontWeight: 'bold'
                  }}>
                    {result.selectedAnswer}
                  </Text>
                  {result.isCorrect ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Correct Answer: </Text>
                  <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {result.question.correctAnswer}
                  </Text>
                </div>

                <Divider />
                
                <div>
                  <Text strong>Explanation:</Text>
                  <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                    {result.question.explanation}
                  </Paragraph>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/practice')}
            style={{ marginBottom: '16px' }}
          >
            Back to Practice
          </Button>
          
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                Practice Test - {categoryId?.charAt(0).toUpperCase() + categoryId?.slice(1)}
              </Title>
              <Text type="secondary">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </Text>
            </Col>
            <Col>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: timeLeft < 300 ? '#ff4d4f' : '#FF7846',
                  marginBottom: '4px'
                }}>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  {formatTime(timeLeft)}
                </div>
                <Text type="secondary">Time Remaining</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '32px' }}>
          <Progress 
            percent={Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)} 
            strokeColor="#FF7846"
            showInfo={false}
          />
        </div>

        {/* Question Card */}
        <Card style={{ marginBottom: '24px' }}>
          <Title level={3} style={{ marginBottom: '24px' }}>
            {currentQuestion?.questionText}
          </Title>
          
          <Radio.Group 
            value={selectedAnswer} 
            onChange={(e) => handleAnswerSelect(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {currentQuestion?.options.map((option) => (
                <Radio key={option.id} value={option.text} style={{ 
                  display: 'block',
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  fontSize: '16px'
                }}>
                  {option.text}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Card>

        {/* Action Buttons */}
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            size="large"
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            style={{ 
              padding: '0 32px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Test'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default PracticeTestPage;