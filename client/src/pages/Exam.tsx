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
  Alert,
  Spin
} from 'antd';
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';
import { useExamQuestions, useCompleteExam } from '../hooks/useExams';

const { Title, Text, Paragraph } = Typography;

interface ExamQuestion {
  questionId: string;
  questionText: string;
  options: Array<{ id: number; text: string }>;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  marksObtained: number;
  category: string;
  marksPerQuestion: number;
}

interface ExamSession {
  sessionId: string;
  examName: string;
  totalMarks: number;
  durationMinutes: number;
  questions: ExamQuestion[];
  status: string;
  startTime: string;
  endTime?: string;
}

const ExamPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [examCompleted, setExamCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Use custom hooks
  const { data: sessionData, isLoading: loading, error: queryError } = useExamQuestions(sessionId || '');
  const completeExamMutation = useCompleteExam();
  
  const session = sessionData?.data as ExamSession | null;

  const currentQuestion = session?.questions[currentQuestionIndex];
  const totalQuestions = session?.questions.length || 0;

  useEffect(() => {
    if (session) {
      setTimeLeft(session.durationMinutes * 60);
    }
  }, [session]);

  useEffect(() => {
    if (timeLeft <= 0 && !examCompleted) {
      handleExamComplete();
    }
  }, [timeLeft, examCompleted]);

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

    // Update the question with the selected answer
    const updatedQuestions = session.questions.map((q, index) => 
      index === currentQuestionIndex 
        ? { ...q, userAnswer: selectedAnswer }
        : q
    );

    setSession(prev => prev ? { ...prev, questions: updatedQuestions } : null);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      handleExamComplete();
    }
  };

  const handleExamComplete = async () => {
    if (!session || !sessionId) return;

    setSubmitting(true);
    try {
      // Calculate results
      const updatedQuestions = session.questions.map(q => {
        const isCorrect = q.userAnswer === q.correctAnswer;
        return {
          ...q,
          isCorrect,
          marksObtained: isCorrect ? q.marksPerQuestion : 0
        };
      });

      const totalMarksObtained = updatedQuestions.reduce((sum, q) => sum + q.marksObtained, 0);
      const percentage = Math.round((totalMarksObtained / session.totalMarks) * 100);

      const examData = {
        questions: updatedQuestions,
        totalMarksObtained,
        percentage,
        timeSpent: session.durationMinutes * 60 - timeLeft
      };

      await completeExamMutation.mutateAsync({ sessionId, examData });
      setExamCompleted(true);
    } catch (error) {
      console.error('Error completing exam:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = () => {
    if (!session) return 0;
    const correct = session.questions.filter(q => q.isCorrect).length;
    return Math.round((correct / session.questions.length) * 100);
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={2} style={{ marginTop: '16px' }}>Loading Exam...</Title>
        </div>
      </AppLayout>
    );
  }

  if (queryError) {
    return (
      <AppLayout>
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <Alert message="Failed to load exam" type="error" />
          <Button 
            type="primary" 
            onClick={() => navigate('/exams')}
            style={{ marginTop: '16px' }}
          >
            Back to Exams
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (examCompleted) {
    const score = getScore();
    const correctAnswers = session?.questions.filter(q => q.isCorrect).length || 0;
    const totalAnswered = session?.questions.length || 0;

    return (
      <AppLayout>
        <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/exams')}
              style={{ marginBottom: '24px' }}
            >
              Back to Exams
            </Button>
            <Title level={1} style={{ textAlign: 'center', marginBottom: '8px' }}>
              <TrophyOutlined style={{ color: '#f59e0b', marginRight: '12px' }} />
              Exam Completed!
            </Title>
            <Text style={{ textAlign: 'center', display: 'block', fontSize: '16px', color: '#6b7280' }}>
              {session?.examName} - Here are your results
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
                  value={formatTime(session?.durationMinutes ? session.durationMinutes * 60 - timeLeft : 0)}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Question Results */}
          <div>
            <Title level={2} style={{ marginBottom: '24px' }}>Question Review</Title>
            {session?.questions.map((question, index) => (
              <Card key={index} style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    Question {index + 1}: {question.questionText}
                  </Text>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Your Answer: </Text>
                  <Text style={{ 
                    color: question.isCorrect ? '#52c41a' : '#ff4d4f',
                    fontWeight: 'bold'
                  }}>
                    {question.userAnswer || 'Not answered'}
                  </Text>
                  {question.userAnswer && (
                    question.isCorrect ? (
                      <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: '8px' }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: '8px' }} />
                    )
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Correct Answer: </Text>
                  <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    {question.correctAnswer}
                  </Text>
                </div>

                <Divider />
                
                <div>
                  <Text strong>Marks: </Text>
                  <Text style={{ color: question.isCorrect ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                    {question.marksObtained}/{question.marksPerQuestion}
                  </Text>
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
            onClick={() => navigate('/exams')}
            style={{ marginBottom: '16px' }}
          >
            Back to Exams
          </Button>
          
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                {session?.examName}
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
            disabled={!selectedAnswer || submitting}
            loading={submitting}
            style={{ 
              padding: '0 32px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Exam'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ExamPage;
