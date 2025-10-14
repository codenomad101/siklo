import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Space,
  Statistic,
  Avatar,
  Divider
} from 'antd';
import {
  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  StarOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { AppLayout } from '../components/AppLayout';

const { Title, Text, Paragraph } = Typography;

export default function LandingPage() {
  const features = [
    {
      icon: <BookOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      title: 'Smart Practice Sessions',
      description: 'Siklo delivers 20 carefully selected questions from multiple categories with adaptive difficulty and 15-minute timed sessions.'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      title: 'Dynamic Exam Builder',
      description: 'Create personalized exams with custom question distribution, flexible timing, and realistic negative marking.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      title: 'Advanced Analytics',
      description: 'Get deep insights into your performance with detailed statistics, weak area identification, and improvement recommendations.'
    },
    {
      icon: <TrophyOutlined style={{ fontSize: '32px', color: '#fa8c16' }} />,
      title: 'Progress Monitoring',
      description: 'Track your journey with weekly and monthly progress reports, streak counters, and achievement milestones.'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'UPSC Aspirant',
      content: 'Siklo helped me improve my accuracy by 40% in just 3 months!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'SSC Candidate',
      content: 'The dynamic exam feature is amazing. It perfectly simulates real exam conditions.',
      rating: 5
    },
    {
      name: 'Anita Singh',
      role: 'Banking Aspirant',
      content: 'Best platform for competitive exam preparation. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <AppLayout showAuth={true} showFooter={false}>
      {/* Hero Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 24px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Title level={1} style={{ color: 'white', fontSize: '3.5rem', marginBottom: '24px' }}>
            Master Your Exams with
            <br />
            <span style={{ color: '#ffd700' }}>Siklo</span>
          </Title>
          
          <Paragraph style={{ 
            fontSize: '1.2rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px auto'
          }}>
            Siklo - Your intelligent study companion for competitive exams. 
            Practice smart, track progress, and achieve your academic goals with our 
            comprehensive platform designed for serious students.
          </Paragraph>
          
          <Space size="large">
            <Link to="/register">
              <Button 
                type="primary" 
                size="large" 
                style={{ 
                  background: '#ffd700', 
                  borderColor: '#ffd700',
                  color: '#333',
                  height: '50px',
                  padding: '0 32px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Start Free Trial
              </Button>
            </Link>
            <Button 
              size="large" 
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                height: '50px',
                padding: '0 32px',
                fontSize: '16px'
              }}
            >
              Watch Demo
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: '60px 24px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[32, 32]} justify="center">
            <Col xs={24} sm={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                <Statistic
                  title="Students"
                  value={10000}
                  suffix="+"
                  valueStyle={{ color: '#1890ff', fontSize: '2rem' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                <Statistic
                  title="Questions"
                  value={50000}
                  suffix="+"
                  valueStyle={{ color: '#52c41a', fontSize: '2rem' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                <Statistic
                  title="Success Rate"
                  value={95}
                  suffix="%"
                  valueStyle={{ color: '#722ed1', fontSize: '2rem' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
                <Statistic
                  title="Subjects"
                  value={8}
                  valueStyle={{ color: '#fa8c16', fontSize: '2rem' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2}>Why Choose Siklo?</Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
              Siklo combines cutting-edge technology with proven learning methodologies 
              to help you achieve your academic goals. Our intelligent platform adapts to your learning style.
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} key={index}>
                <Card 
                  hoverable
                  style={{ 
                    height: '100%',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0'
                  }}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '20px' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666', margin: 0 }}>
                      {feature.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ padding: '80px 24px', background: '#f8f9fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2}>What Our Students Say</Title>
            <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>
              Join thousands of successful students who have achieved their goals with Siklo
            </Paragraph>
          </div>
          
          <Row gutter={[32, 32]}>
            {testimonials.map((testimonial, index) => (
              <Col xs={24} md={8} key={index}>
                <Card 
                  style={{ 
                    height: '100%',
                    borderRadius: '12px',
                    border: '1px solid #f0f0f0'
                  }}
                  bodyStyle={{ padding: '32px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Avatar 
                      size={64} 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#1890ff', marginBottom: '20px' }}
                    />
                    <div style={{ marginBottom: '16px' }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarOutlined key={i} style={{ color: '#ffd700', marginRight: '4px' }} />
                      ))}
                    </div>
                    <Paragraph style={{ fontStyle: 'italic', marginBottom: '20px' }}>
                      "{testimonial.content}"
                    </Paragraph>
                    <div>
                      <Text strong>{testimonial.name}</Text>
                      <br />
                      <Text type="secondary">{testimonial.role}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ 
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '20px' }}>
            Ready to Excel with Siklo?
          </Title>
          <Paragraph style={{ 
            fontSize: '1.1rem', 
            color: 'rgba(255,255,255,0.9)', 
            marginBottom: '40px' 
          }}>
            Join thousands of students who have already improved their performance with Siklo. 
            Start your journey towards academic success today.
          </Paragraph>
          <Link to="/register">
            <Button 
              type="primary" 
              size="large" 
              style={{ 
                background: '#ffd700', 
                borderColor: '#ffd700',
                color: '#333',
                height: '50px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}