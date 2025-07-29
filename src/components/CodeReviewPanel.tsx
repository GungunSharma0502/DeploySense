/**
 * Code review panel component displaying AI-powered code analysis
 * Shows detailed review results, suggestions, and quality metrics
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Bot, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
  GitPullRequest,
  Eye,
  ThumbsUp,
  ThumbsDown
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

interface CodeReviewPanelProps {
  reviews: ReviewData[];
  repositories: Repository[];
}

interface ReviewDetail {
  id: string;
  type: 'error' | 'warning' | 'suggestion' | 'improvement';
  file: string;
  line: number;
  message: string;
  suggestion: string;
  severity: 'high' | 'medium' | 'low';
}

export default function CodeReviewPanel({ reviews, repositories }: CodeReviewPanelProps) {
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  // Mock detailed review data
  const reviewDetails: ReviewDetail[] = [
    {
      id: '1',
      type: 'error',
      file: 'src/components/UserProfile.tsx',
      line: 45,
      message: 'Potential null pointer exception',
      suggestion: 'Add null check before accessing user.profile properties',
      severity: 'high'
    },
    {
      id: '2',
      type: 'warning',
      file: 'src/utils/validation.ts',
      line: 23,
      message: 'Unused import statement',
      suggestion: 'Remove unused import "lodash" to reduce bundle size',
      severity: 'low'
    },
    {
      id: '3',
      type: 'improvement',
      file: 'src/hooks/useAuth.ts',
      line: 67,
      message: 'Consider using React.useMemo for expensive computations',
      suggestion: 'Wrap the token validation logic in useMemo to improve performance',
      severity: 'medium'
    },
    {
      id: '4',
      type: 'suggestion',
      file: 'src/pages/Dashboard.tsx',
      line: 12,
      message: 'Component could be split into smaller components',
      suggestion: 'Consider extracting the statistics cards into a separate component',
      severity: 'medium'
    }
  ];

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || review.status === filter
  );

  /**
   * Get icon based on review detail type
   */
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'improvement': return <TrendingUp className="h-4 w-4 text-blue-400" />;
      case 'suggestion': return <MessageSquare className="h-4 w-4 text-purple-400" />;
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  /**
   * Apply suggestion
   */
  const applySuggestion = (detailId: string) => {
    console.log('Applying suggestion:', detailId);
    // In a real app, this would apply the code suggestion
  };

  /**
   * Ignore suggestion
   */
  const ignoreSuggestion = (detailId: string) => {
    console.log('Ignoring suggestion:', detailId);
    // In a real app, this would mark the suggestion as ignored
  };

  return (
    <div className="space-y-6">
      {/* Review Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Bot className="h-5 w-5 text-purple-400" />
                <span>AI Code Reviews</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Automated code quality analysis and improvement suggestions
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {(['all', 'completed', 'pending', 'failed'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={`text-xs ${filter === status ? 'bg-purple-600' : ''}`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {reviews.filter(r => r.status === status).length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Reviews</p>
                  <p className="text-2xl font-bold text-white">{reviews.length}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-green-400">
                    {reviews.length > 0 ? Math.round(reviews.reduce((acc, r) => acc + r.qualityScore, 0) / reviews.length) : 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {reviews.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No reviews found</h3>
                <p className="text-slate-400">
                  {filter === 'all' 
                    ? 'Connect repositories to start getting AI-powered code reviews' 
                    : `No ${filter} reviews available`}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div 
                  key={review.id} 
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${ 
                    selectedReview?.id === review.id 
                      ? 'bg-purple-900/30 border-purple-500' 
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-purple-500/20 rounded-full flex-shrink-0">
                        <Bot className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <h3 className="font-medium text-white truncate">{review.repository}</h3>
                          <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                            <GitPullRequest className="h-3 w-3" />
                            <span>{review.pullRequest}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{review.author}</span>
                          </div>
                          <span>{review.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-left sm:text-right">
                        <div className={`text-lg font-bold ${
                          review.qualityScore >= 85 ? 'text-green-400' : 
                          review.qualityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {review.qualityScore}%
                        </div>
                        <p className="text-xs text-slate-400">{review.suggestions} suggestions</p>
                      </div>
                      <Badge 
                        variant={review.status === 'completed' ? "default" : "secondary"}
                        className={`${
                          review.status === 'completed' ? 'bg-green-600' : 
                          review.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                        } text-xs`}
                      >
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {review.qualityScore < 85 && (
                    <div className="mt-3 flex items-center space-x-2 text-sm text-yellow-400">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span>Quality score below deployment threshold (85%)</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Review */}
      {selectedReview && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-white">
                  Review Details: {selectedReview.repository} {selectedReview.pullRequest}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Detailed analysis and AI-generated improvement suggestions
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedReview(null)}
                className="sm:w-auto w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Close Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 overflow-x-auto">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="issues" className="text-xs sm:text-sm">Issues</TabsTrigger>
                <TabsTrigger value="suggestions" className="text-xs sm:text-sm">Suggestions</TabsTrigger>
                <TabsTrigger value="metrics" className="text-xs sm:text-sm">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Quality Score Breakdown</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Code Quality</span>
                          <span className="text-sm text-white">92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Security</span>
                          <span className="text-sm text-white">88%</span>
                        </div>
                        <Progress value={88} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Performance</span>
                          <span className="text-sm text-white">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-400">Maintainability</span>
                          <span className="text-sm text-white">79%</span>
                        </div>
                        <Progress value={79} className="h-2" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Summary</h3>
                    <div className="space-y-3 text-sm text-slate-300">
                      <p>✅ Code follows established patterns and conventions</p>
                      <p>✅ No critical security vulnerabilities detected</p>
                      <p>⚠️ Some performance optimizations recommended</p>
                      <p>⚠️ Component complexity could be reduced</p>
                      <p>✅ Good test coverage (87%)</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="issues" className="space-y-4">
                <div className="space-y-4">
                  {reviewDetails.filter(d => d.type === 'error' || d.type === 'warning').map((detail) => (
                    <div key={detail.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(detail.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                            <h4 className="font-medium text-white">{detail.message}</h4>
                            <Badge className={`text-xs w-fit ${getSeverityColor(detail.severity)}`}>
                              {detail.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2 break-all">
                            {detail.file}:{detail.line}
                          </p>
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-600">
                            <p className="text-sm text-slate-300">{detail.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                <div className="space-y-4">
                  {reviewDetails.filter(d => d.type === 'improvement' || d.type === 'suggestion').map((detail) => (
                    <div key={detail.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-start space-x-3">
                        {getTypeIcon(detail.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                            <h4 className="font-medium text-white">{detail.message}</h4>
                            <Badge className={`text-xs w-fit ${getSeverityColor(detail.severity)}`}>
                              {detail.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2 break-all">
                            {detail.file}:{detail.line}
                          </p>
                          <div className="p-3 bg-slate-800/50 rounded border border-slate-600 mb-3">
                            <p className="text-sm text-slate-300">{detail.suggestion}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => applySuggestion(detail.id)}
                              className="bg-green-600/20 hover:bg-green-600/30 text-green-400 border-green-600 text-xs"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              Apply Suggestion
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => ignoreSuggestion(detail.id)}
                              className="text-xs"
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              Ignore
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Code Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lines of Code</span>
                        <span className="text-white">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cyclomatic Complexity</span>
                        <span className="text-white">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Test Coverage</span>
                        <span className="text-green-400">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Duplicated Code</span>
                        <span className="text-yellow-400">3.2%</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-white text-base">Security Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Critical Issues</span>
                        <span className="text-green-400">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">High Priority</span>
                        <span className="text-yellow-400">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Medium Priority</span>
                        <span className="text-slate-400">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dependencies</span>
                        <span className="text-green-400">Up to date</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
