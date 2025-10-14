import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Space
} from 'antd';
import { ReadOutlined, FormOutlined, QuestionCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';

const { Title, Text } = Typography;
const { Option } = Select;

interface Category {
  id: string;
  name: string;
  description: string;
  questionCount: number;
}

const categories: Category[] = [
  { id: 'economy', name: 'Economy', description: 'Economic concepts and current affairs', questionCount: 200 },
  { id: 'gk', name: 'General Knowledge', description: 'General awareness and current events', questionCount: 300 },
  { id: 'history', name: 'History', description: 'Indian and world history', questionCount: 250 },
  { id: 'geography', name: 'Geography', description: 'Physical and human geography', questionCount: 180 },
  { id: 'english', name: 'English', description: 'Grammar and language skills', questionCount: 220 },
  { id: 'aptitude', name: 'Aptitude', description: 'Quantitative and logical reasoning', questionCount: 280 },
  { id: 'agriculture', name: 'Agriculture', description: 'Agricultural science and practices', questionCount: 150 },
  { id: 'marathi', name: 'Marathi', description: 'Marathi language and literature', questionCount: 120 },
];

const PracticePage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<'practice' | 'exam'>('practice');

  return (
    <AppLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
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

        {selectedMode === 'practice' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={3}>Practice Sessions</Title>
              <Text type="secondary">Choose a category to start practicing with 20 random questions and a 15-minute timer.</Text>
            </div>

            <Row gutter={[16, 16]} justify="center">
              {categories.map((category) => (
                <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    title={category.name}
                    extra={<Text type="secondary">{category.questionCount} questions</Text>}
                    actions={[
                      <Button type="primary" icon={<ReadOutlined />}>Start Practice</Button>
                    ]}
                  >
                    <Card.Meta
                      description={
                        <Space direction="vertical">
                          <Text>{category.description}</Text>
                          <Space>
                            <ClockCircleOutlined />
                            <Text>15 min</Text>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Title level={3}>Dynamic Exam Configuration</Title>
              <Text type="secondary">Create custom exams with configurable question distribution, timer, and negative marking.</Text>
            </div>

            <Card style={{ maxWidth: 800, margin: '0 auto' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Input addonBefore="Exam Name" defaultValue="Quick Test" />
                <InputNumber addonBefore="Duration (minutes)" defaultValue={20} min={1} style={{ width: '100%' }} />
                <InputNumber addonBefore="Total Marks" defaultValue={40} min={1} style={{ width: '100%' }} />
                <Select addonBefore="Negative Marking" defaultValue="yes" style={{ width: '100%' }}>
                  <Option value="yes">Yes (-25%)</Option>
                  <Option value="no">No</Option>
                </Select>

                <Title level={4} style={{ marginTop: '24px', marginBottom: '16px' }}>Question Distribution</Title>
                {categories.map((category, index) => (
                  <Row key={category.id} align="middle" gutter={16}>
                    <Col span={8}>
                      <Text strong>{category.name}</Text>
                      <Text type="secondary" style={{ marginLeft: '8px' }}>({category.questionCount} available)</Text>
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={0}
                        max={10}
                        defaultValue={index < 4 ? 3 : 2}
                        addonAfter="questions"
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col span={8}>
                      <InputNumber
                        min={1}
                        defaultValue={2}
                        addonAfter="marks each"
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>
                ))}
                <Button type="primary" size="large" style={{ width: '100%', marginTop: '24px' }} icon={<FormOutlined />}>
                  Start Exam
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