import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Segmented, 
  Input, 
  Select, 
  InputNumber, 
  Space,
  Spin
} from 'antd';
import { ReadOutlined, FormOutlined, QuestionCircleOutlined, ClockCircleOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';
import { useCategories, useTopics } from '../hooks/useCategories';
import { useCreateDynamicExam } from '../hooks/useExams';
import { useUserStatistics } from '../hooks/useStatistics';

const { Title, Text } = Typography;
const { Option } = Select;

const PracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam'>('practice');
  const [examConfig, setExamConfig] = useState({
    examName: 'Quick Test',
    duration: 20,
    totalMarks: 40,
    negativeMarking: 'yes',
    questionDistribution: [] as Array<{ category: string; count: number; marksPerQuestion: number; topic?: string }>
  });
  const navigate = useNavigate();

  // Use custom hooks
  const { data: categories = [], isLoading: loading } = useCategories();
  const createExamMutation = useCreateDynamicExam();
  const { data: userStats } = useUserStatistics();

  useEffect(() => {
    // Initialize question distribution for exam mode
    if (searchParams.get('mode') === 'exam') {
      setSelectedMode('exam');
      const distribution = (categories || []).slice(0, 4).map((cat, index) => ({
        category: cat.id,
        count: index < 2 ? 5 : 3,
        marksPerQuestion: 2
      }));
      setExamConfig(prev => ({
        ...prev,
        questionDistribution: distribution
      }));
    }
  }, [searchParams, categories]);

  const handleViewCategory = (slug: string) => {
    navigate(`/category/${slug}`);
  };

  const handleCreateExam = async () => {
    // Validate that we have question distribution
    if (examConfig.questionDistribution.length === 0) {
      // If no distribution, create one from available categories
      const distribution = (categories || []).slice(0, 4).map((cat, index) => ({
        category: cat.id,
        count: index < 2 ? 5 : 3,
        marksPerQuestion: 2
      }));
      
      if (distribution.length === 0) {
        console.error('No categories available for exam creation');
        return;
      }
      
      setExamConfig(prev => ({
        ...prev,
        questionDistribution: distribution
      }));
    }

    const examData = {
      examName: examConfig.examName,
      totalMarks: examConfig.totalMarks,
      durationMinutes: examConfig.duration,
      questionDistribution: examConfig.questionDistribution,
      negativeMarking: examConfig.negativeMarking === 'yes',
      negativeMarksRatio: 0.25
    };

    try {
      const response = await createExamMutation.mutateAsync(examData);
      
      if (response.success) {
        // Navigate to the exam
        navigate(`/exam/${response.data.sessionId}`);
      } else {
        console.error('Failed to create exam:', response.message);
      }
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const updateQuestionDistribution = (categoryId: string, field: 'count' | 'marksPerQuestion' | 'topic' | 'category', value: any) => {
    setExamConfig(prev => ({
      ...prev,
      questionDistribution: prev.questionDistribution.map(dist => 
        dist.category === categoryId ? { ...dist, [field]: value } : dist
      )
    }));
  };

  const addDistribution = (newCategoryId: string) => {
    if (!newCategoryId) return;
    setExamConfig(prev => ({
      ...prev,
      questionDistribution: [
        ...prev.questionDistribution.filter(d => d.category !== newCategoryId),
        { category: newCategoryId, count: 5, marksPerQuestion: 2 }
      ]
    }));
  };

  const removeDistribution = (categoryId: string) => {
    setExamConfig(prev => ({
      ...prev,
      questionDistribution: prev.questionDistribution.filter(d => d.category !== categoryId)
    }));
  };

  return (
    <AppLayout>
      <div style={{ padding: '32px 24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
          <Segmented
            options={[
              { label: 'Practice Sessions', value: 'practice', icon: <ReadOutlined /> },
              { label: 'Dynamic Exams', value: 'exam', icon: <FormOutlined /> },
            ]}
            value={selectedMode}
            onChange={(value) => setSelectedMode(value as 'practice' | 'exam')}
            size="large"
          />
        </div>

        {/* User Statistics */}
        {userStats && (
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', marginBottom: '4px' }}>
                    {userStats.totalQuestionsAttempted || 0}
                  </div>
                  <Text type="secondary">Total Questions Solved</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                    {userStats.totalCorrectAnswers || 0}
                  </div>
                  <Text type="secondary">Correct Answers</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14', marginBottom: '4px' }}>
                    {userStats.currentStreak || 0}
                  </div>
                  <Text type="secondary">Current Streak</Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1', marginBottom: '4px' }}>
                    {Math.round(parseFloat(userStats.overallAccuracy || '0'))}%
                  </div>
                  <Text type="secondary">Overall Accuracy</Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {selectedMode === 'practice' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Title level={2} style={{ 
                margin: '0 0 8px 0',
                fontSize: '28px',
                fontWeight: '800',
                color: '#1f2937'
              }}>
                Practice Sessions
              </Title>
              <Text style={{ 
                fontSize: '16px', 
                color: '#6b7280',
                fontWeight: '500'
              }}>
                Choose a category to start practicing with 20 random questions and a 15-minute timer.
              </Text>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: '#6b7280' }}>
                  Loading categories...
                </div>
              </div>
            ) : (
              <Row gutter={[16, 16]} justify="center">
                {(categories || []).map((category) => (
                  <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
                    <CategoryCard
                      name={category.name}
                      description={category.description}
                      color={category.color}
                      slug={category.slug}
                      onView={() => handleViewCategory(category.slug)}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={3}>Dynamic Exam Configuration</Title>
              <Text type="secondary">Create custom exams with configurable question distribution, timer, and negative marking.</Text>
            </div>

            <Card style={{ maxWidth: 800, margin: '0 auto' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input 
                  addonBefore="Exam Name" 
                  value={examConfig.examName}
                  onChange={(e) => setExamConfig(prev => ({ ...prev, examName: e.target.value }))}
                />
                <InputNumber 
                  addonBefore="Duration (minutes)" 
                  value={examConfig.duration}
                  onChange={(value) => setExamConfig(prev => ({ ...prev, duration: value || 20 }))}
                  min={1} 
                  style={{ width: '100%' }} 
                />
                <InputNumber 
                  addonBefore="Total Marks" 
                  value={examConfig.totalMarks}
                  onChange={(value) => setExamConfig(prev => ({ ...prev, totalMarks: value || 40 }))}
                  min={1} 
                  style={{ width: '100%' }} 
                />
                <Select 
                  addonBefore="Negative Marking" 
                  value={examConfig.negativeMarking}
                  onChange={(value) => setExamConfig(prev => ({ ...prev, negativeMarking: value }))}
                  style={{ width: '100%' }}
                >
                  <Option value="yes">Yes (-25%)</Option>
                  <Option value="no">No</Option>
                </Select>

                <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>Question Distribution</Title>
                <Space style={{ marginBottom: 12 }} wrap>
                  <Select
                    placeholder="Add category"
                    style={{ minWidth: 260 }}
                    onChange={(value) => addDistribution(value)}
                    value={undefined}
                  >
                    {(categories || []).map((c: any) => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                  </Select>
                  <Button icon={<PlusOutlined />} onClick={() => {
                    const first = (categories || [])[0];
                    if (first) addDistribution(first.id);
                  }}>Quick add first</Button>
                </Space>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin />
                    <div style={{ marginTop: '8px', color: '#6b7280' }}>
                      Loading categories...
                    </div>
                  </div>
                ) : (
                  (examConfig.questionDistribution || []).map((dist) => (
                    <DistributionRow
                      key={dist.category}
                      dist={dist}
                      categories={categories}
                      onChange={(field, value) => updateQuestionDistribution(dist.category, field as any, value)}
                      onRemove={() => removeDistribution(dist.category)}
                    />
                  ))
                )}
                <Button 
                  type="primary" 
                  size="large" 
                  style={{ width: '100%', marginTop: '24px' }} 
                  icon={<FormOutlined />}
                  loading={createExamMutation.isPending}
                  onClick={handleCreateExam}
                >
                  {createExamMutation.isPending ? 'Creating Exam...' : 'Start Exam'}
                </Button>
              </Space>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default PracticePage;

// Local presentational component to avoid hooks-in-loop issues
function CategoryCard({ name, description, color, slug, onView }: { name: string; description?: string; color?: string; slug: string; onView: () => void; }) {
  const { data: topics = [] } = useTopics(slug);
  return (
    <Card
      hoverable
      style={{
        borderRadius: '12px',
        border: '2px solid #f3f4f6',
        transition: 'all 0.2s ease',
        height: '100%'
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ 
        width: '48px',
        height: '48px',
        borderRadius: '10px',
        background: color,
        marginBottom: '16px'
      }} />
      <Title level={4} style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{name}</Title>
      <Text style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500', display: 'block', marginBottom: '8px' }}>{description}</Text>
      {Array.isArray(topics) && topics.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>Popular topics:</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {topics.slice(0, 4).map((t: any) => (
              <span key={t.slug} style={{ background: '#f3f4f6', color: '#374151', borderRadius: 12, padding: '2px 8px', fontSize: 12 }}>{t.name}</span>
            ))}
          </div>
        </div>
      )}
      <Space style={{ marginBottom: '16px' }}>
        <ClockCircleOutlined style={{ color: '#6b7280' }} />
        <Text style={{ fontSize: '13px', color: '#6b7280' }}>15 min</Text>
        <QuestionCircleOutlined style={{ color: '#6b7280' }} />
        <Text style={{ fontSize: '13px', color: '#6b7280' }}>20 questions</Text>
      </Space>
      <Button type="primary" icon={<ReadOutlined />} onClick={onView} style={{ width: '100%', height: '40px', fontSize: '14px', fontWeight: '600', borderRadius: '8px' }}>View Topics</Button>
    </Card>
  );
}

function DistributionRow({ dist, categories, onChange, onRemove }: { dist: any; categories: any[]; onChange: (field: 'count' | 'marksPerQuestion' | 'topic' | 'category', value: any) => void; onRemove: () => void; }) {
  const category = categories.find((c: any) => c.id === dist.category);
  const { data: topics = [] } = useTopics(category?.slug);
  return (
    <Card size="small" style={{ marginBottom: 8 }}>
      <Row align="middle" gutter={12}>
        <Col xs={24} md={7}>
          <Select
            value={dist.category}
            onChange={(val) => onChange('category', val)}
            style={{ width: '100%' }}
          >
            {categories.map((c: any) => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} md={5}>
          <InputNumber
            min={0}
            max={Math.min(50, category?.questionCount || 10)}
            value={dist.count}
            onChange={(value) => onChange('count', value || 0)}
            addonAfter="qs"
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={12} md={5}>
          <InputNumber
            min={1}
            value={dist.marksPerQuestion}
            onChange={(value) => onChange('marksPerQuestion', value || 1)}
            addonAfter="marks"
            style={{ width: '100%' }}
          />
        </Col>
        <Col xs={18} md={5}>
          <Select
            placeholder="Topic (optional)"
            allowClear
            value={dist.topic}
            onChange={(value) => onChange('topic', value)}
            style={{ width: '100%' }}
          >
            {Array.isArray(topics) && topics.map((t: any) => (
              <Option key={t.slug} value={t.slug}>{t.name}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={6} md={2} style={{ textAlign: 'right' }}>
          <Button danger icon={<DeleteOutlined />} onClick={onRemove} />
        </Col>
      </Row>
    </Card>
  );
}