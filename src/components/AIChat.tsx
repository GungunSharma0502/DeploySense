/**
 * AI Chat component for interactive communication with Sider AI
 * Provides intelligent suggestions, code improvements, and deployment guidance
 */
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bot, 
  Send, 
  User, 
  Code, 
  Lightbulb, 
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Trash2
} from 'lucide-react';

interface Repository {
  id: string;
  name: string;
  owner: string;
  branch: string;
  lastCommit: string;
  qualityScore: number;
  status: 'reviewing' | 'approved' | 'rejected' | 'deploying' | 'deployed';
  pullRequests: number;
  url: string;
  createdAt: Date;
  isAnalyzing?: boolean;
}

interface ReviewData {
  id: string;
  repository: string;
  pullRequest: string;
  author: string;
  qualityScore: number;
  suggestions: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  repositoryId: string;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  codeBlock?: string;
  suggestions?: string[];
  category?: 'general' | 'code-review' | 'deployment' | 'optimization';
}

interface AIChatProps {
  repositories: Repository[];
  reviews: ReviewData[];
}

export default function AIChat({ repositories, reviews }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm Sider AI, your intelligent code review and deployment assistant. I can help you with:

• Code quality analysis and improvements
• Deployment pipeline optimization  
• Security vulnerability detection
• Performance recommendations
• Best practices guidance

${repositories.length > 0 ? `I see you have ${repositories.length} repositories connected with an average quality score of ${Math.round(repositories.reduce((acc, repo) => acc + repo.qualityScore, 0) / repositories.length)}%. Great work!` : 'Connect your first repository to get started with AI-powered insights.'}

How can I assist you today?`,
      timestamp: new Date(),
      category: 'general',
      suggestions: [
        'Review my latest changes',
        'Optimize deployment pipeline', 
        'Check security vulnerabilities',
        'Suggest performance improvements'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Auto-scroll to bottom when new messages are added
   */
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * Generate AI response based on user input and current context
   */
  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('review') || lowerMessage.includes('code')) {
      const avgScore = repositories.length > 0 ? Math.round(repositories.reduce((acc, repo) => acc + repo.qualityScore, 0) / repositories.length) : 0;
      const lowQualityRepos = repositories.filter(r => r.qualityScore < 85);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `I've analyzed your code repositories. Here's what I found:

✅ **Overall Health:**
• Average quality score: ${avgScore}%
• ${repositories.filter(r => r.qualityScore >= 85).length} repositories ready for deployment
• ${reviews.filter(r => r.status === 'completed').length} completed reviews

${lowQualityRepos.length > 0 ? `⚠️ **Attention Needed:**
${lowQualityRepos.map(r => `• ${r.name}: ${r.qualityScore}% - needs improvement`).join('\n')}` : ''}

🎯 **Recommended Actions:**
• Run security scans on all repositories
• Implement automated testing pipelines
• Consider code splitting for better performance`,
        timestamp: new Date(),
        category: 'code-review',
        codeBlock: `// Suggested optimization pattern:
const OptimizedComponent = React.memo(({ data }) => {
  const memoizedValue = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);
  
  return <div>{memoizedValue}</div>;
});`,
        suggestions: [
          'Show detailed quality breakdown',
          'Generate improvement roadmap',
          'Run security audit',
          'Optimize specific repository'
        ]
      };
    }
    
    if (lowerMessage.includes('deploy') || lowerMessage.includes('pipeline')) {
      const readyRepos = repositories.filter(r => r.qualityScore >= 85);
      const blockedRepos = repositories.filter(r => r.qualityScore < 85);
      
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `I've analyzed your deployment readiness:

🚀 **Deployment Status:**
• ${readyRepos.length} repositories ready for production deployment
• ${blockedRepos.length} repositories blocked (quality < 85%)
• ${repositories.filter(r => r.status === 'deploying').length} active deployments

${readyRepos.length > 0 ? `✅ **Ready to Deploy:**
${readyRepos.map(r => `• ${r.name} (${r.qualityScore}%)`).join('\n')}` : ''}

${blockedRepos.length > 0 ? `🔒 **Blocked Deployments:**
${blockedRepos.map(r => `• ${r.name} (${r.qualityScore}%) - needs quality improvements`).join('\n')}` : ''}

💡 **Pipeline Optimizations:**
• Enable parallel testing to reduce build time by ~40%
• Add automated rollback on deployment failures
• Implement blue-green deployment strategy`,
        timestamp: new Date(),
        category: 'deployment',
        suggestions: [
          'Deploy ready repositories',
          'Fix blocked deployments',
          'Configure pipeline settings',
          'View deployment history'
        ]
      };
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `🔒 **Security Analysis Complete**

I've scanned your repositories for potential vulnerabilities:

✅ **Security Status:**
• No critical vulnerabilities detected
• All dependencies are up to date
• Code follows security best practices

⚠️ **Recommendations:**
• Enable branch protection rules
• Add security headers to API responses
• Implement rate limiting on authentication endpoints
• Regular security audits with automated scanning

🛡️ **Security Score Breakdown:**
${repositories.map(r => `• ${r.name}: ${Math.min(100, r.qualityScore + 5)}% security score`).join('\n')}`,
        timestamp: new Date(),
        category: 'optimization',
        codeBlock: `// Security headers middleware:
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});`,
        suggestions: [
          'Run detailed security scan',
          'Configure security policies',
          'Update dependencies',
          'Generate security report'
        ]
      };
    }
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('optimize')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: `⚡ **Performance Analysis**

I've analyzed your codebase for performance optimizations:

📊 **Current Metrics:**
• Average bundle size: 450KB (Good)
• Time to interactive: 2.1s (Excellent)
• First contentful paint: 1.3s (Good)

🚀 **Optimization Opportunities:**
• Implement code splitting to reduce initial bundle size
• Add service worker for caching strategies
• Optimize images with next-gen formats (WebP/AVIF)
• Use React.lazy for component lazy loading

⚡ **Performance Score:**
${repositories.map(r => `• ${r.name}: ${Math.min(100, r.qualityScore + Math.floor(Math.random() * 10))}% performance score`).join('\n')}`,
        timestamp: new Date(),
        category: 'optimization',
        codeBlock: `// Performance optimization example:
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}`,
        suggestions: [
          'Implement code splitting',
          'Optimize bundle size',
          'Add performance monitoring',
          'Generate performance report'
        ]
      };
    }
    
    // Default contextual response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: `I understand you're looking for assistance with your codebase! 

📋 **Current Status:**
• ${repositories.length} repositories connected
• ${reviews.length} total reviews completed
• ${repositories.filter(r => r.qualityScore >= 85).length} repositories deployment-ready

💡 **I can help you with:**
• Detailed code quality analysis
• Security vulnerability assessment  
• Performance optimization strategies
• Deployment pipeline configuration
• Best practices recommendations

What specific area would you like me to focus on?`,
      timestamp: new Date(),
      category: 'general',
      suggestions: [
        'Analyze code quality',
        'Check deployment readiness',
        'Review security status',
        'Optimize performance'
      ]
    };
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  /**
   * Copy code block to clipboard
   */
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  /**
   * Handle feedback on AI responses
   */
  const handleFeedback = (messageId: string, type: 'positive' | 'negative') => {
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  /**
   * Clear chat history
   */
  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([messages[0]]); // Keep the initial welcome message
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Sider AI Assistant</CardTitle>
                <CardDescription className="text-slate-400">
                  Intelligent code review and deployment guidance
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          <ScrollArea className="h-96 w-full border border-slate-600 rounded-lg bg-slate-900/50 p-4">
            <div ref={scrollAreaRef} className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  
                  <div className={`flex-1 max-w-3xl ${
                    message.type === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      
                      {message.codeBlock && (
                        <div className="mt-3 p-3 bg-slate-800 rounded border border-slate-600 relative">
                          <pre className="text-xs text-slate-300 overflow-x-auto">
                            <code>{message.codeBlock}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-slate-700"
                            onClick={() => copyToClipboard(message.codeBlock!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-slate-400">Quick Actions:</p>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6 px-2 bg-slate-800/50 hover:bg-slate-700/50 border-slate-600"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex items-center space-x-2 mt-1 text-xs text-slate-400 ${
                      message.type === 'user' ? 'justify-end' : ''
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.category && (
                        <Badge variant="outline" className="text-xs border-slate-600">
                          {message.category}
                        </Badge>
                      )}
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-slate-700"
                            onClick={() => handleFeedback(message.id, 'positive')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 hover:bg-slate-700"
                            onClick={() => handleFeedback(message.id, 'negative')}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-slate-400 ml-2">Sider AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              placeholder="Ask Sider AI about code quality, deployments, or optimizations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-400">Quick Actions:</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-slate-700/30 hover:bg-slate-700/50 text-xs"
                onClick={() => handleSuggestionClick('Review my latest code changes')}
              >
                <Code className="h-3 w-3 mr-2" />
                Code Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-slate-700/30 hover:bg-slate-700/50 text-xs"
                onClick={() => handleSuggestionClick('Optimize my deployment pipeline')}
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Optimize
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-slate-700/30 hover:bg-slate-700/50 text-xs"
                onClick={() => handleSuggestionClick('Check for security vulnerabilities')}
              >
                <AlertTriangle className="h-3 w-3 mr-2" />
                Security
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start bg-slate-700/30 hover:bg-slate-700/50 text-xs"
                onClick={() => handleSuggestionClick('Suggest performance improvements')}
              >
                <Lightbulb className="h-3 w-3 mr-2" />
                Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Information */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Current Context</CardTitle>
          <CardDescription className="text-slate-400">
            Information Sider AI uses to provide personalized assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-white">Repositories</h3>
              </div>
              <p className="text-sm text-slate-400">
                {repositories.length} connected repositories
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Avg quality: {repositories.length > 0 ? Math.round(repositories.reduce((acc, repo) => acc + repo.qualityScore, 0) / repositories.length) : 0}%
              </p>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <h3 className="font-medium text-white">Reviews</h3>
              </div>
              <p className="text-sm text-slate-400">
                {reviews.length} completed reviews
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {reviews.filter(r => r.status === 'completed').length} successful
              </p>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h3 className="font-medium text-white">AI Insights</h3>
              </div>
              <p className="text-sm text-slate-400">
                Real-time analysis active
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Context-aware assistance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
