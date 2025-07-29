/**
 * Main dashboard for AI-Powered Code Review & Deployment System
 * Displays repository overview, recent reviews, and system status
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  GitBranch, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bot, 
  Rocket, 
  Github,
  MessageSquare,
  Settings,
  TrendingUp,
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react';
import RepositoryManager from '../components/RepositoryManager';
import CodeReviewPanel from '../components/CodeReviewPanel';
import DeploymentPipeline from '../components/DeploymentPipeline';
import AIChat from '../components/AIChat';

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

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([
    {
      id: '1',
      name: 'react-dashboard',
      owner: 'mycompany',
      branch: 'main',
      lastCommit: '2h ago',
      qualityScore: 92,
      status: 'approved',
      pullRequests: 3,
      url: 'https://github.com/mycompany/react-dashboard',
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'api-service',
      owner: 'mycompany',
      branch: 'feature/auth',
      lastCommit: '15m ago',
      qualityScore: 87,
      status: 'deploying',
      pullRequests: 1,
      url: 'https://github.com/mycompany/api-service',
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'mobile-app',
      owner: 'mycompany',
      branch: 'develop',
      lastCommit: '1h ago',
      qualityScore: 74,
      status: 'reviewing',
      pullRequests: 2,
      url: 'https://github.com/mycompany/mobile-app',
      createdAt: new Date()
    }
  ]);

  const [reviews, setReviews] = useState<ReviewData[]>([
    {
      id: '1',
      repository: 'react-dashboard',
      pullRequest: '#156',
      author: 'john.doe',
      qualityScore: 92,
      suggestions: 3,
      status: 'completed',
      timestamp: '2h ago',
      repositoryId: '1'
    },
    {
      id: '2',
      repository: 'api-service',
      pullRequest: '#89',
      author: 'jane.smith',
      qualityScore: 87,
      suggestions: 5,
      status: 'completed',
      timestamp: '15m ago',
      repositoryId: '2'
    },
    {
      id: '3',
      repository: 'mobile-app',
      pullRequest: '#23',
      author: 'mike.wilson',
      qualityScore: 74,
      suggestions: 8,
      status: 'pending',
      timestamp: '5m ago',
      repositoryId: '3'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Add new repository with AI analysis simulation
   */
  const addRepository = async (repoUrl: string): Promise<boolean> => {
    try {
      // Parse GitHub URL
      const urlParts = repoUrl.replace('https://github.com/', '').split('/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid GitHub URL format');
      }

      const [owner, name] = urlParts;
      
      // Check if repository already exists
      if (repositories.some(repo => repo.owner === owner && repo.name === name)) {
        throw new Error('Repository already connected');
      }

      const newRepo: Repository = {
        id: Date.now().toString(),
        name,
        owner,
        branch: 'main',
        lastCommit: 'just now',
        qualityScore: 0,
        status: 'reviewing',
        pullRequests: 0,
        url: repoUrl,
        createdAt: new Date(),
        isAnalyzing: true
      };

      setRepositories(prev => [...prev, newRepo]);

      // Simulate AI analysis process
      setTimeout(() => {
        const analysisScore = Math.floor(Math.random() * 40) + 60; // 60-100%
        const analysisStatus = analysisScore >= 85 ? 'approved' : analysisScore >= 70 ? 'reviewing' : 'rejected';
        
        setRepositories(prev => 
          prev.map(repo => 
            repo.id === newRepo.id 
              ? { 
                  ...repo, 
                  qualityScore: analysisScore,
                  status: analysisStatus,
                  pullRequests: Math.floor(Math.random() * 5) + 1,
                  isAnalyzing: false
                }
              : repo
          )
        );

        // Add corresponding review
        const newReview: ReviewData = {
          id: Date.now().toString(),
          repository: name,
          pullRequest: '#' + Math.floor(Math.random() * 200 + 1),
          author: 'ai-analysis',
          qualityScore: analysisScore,
          suggestions: Math.floor(Math.random() * 10) + 1,
          status: 'completed',
          timestamp: 'just now',
          repositoryId: newRepo.id
        };

        setReviews(prev => [newReview, ...prev]);
      }, 3000);

      return true;
    } catch (error) {
      console.error('Failed to add repository:', error);
      return false;
    }
  };

  /**
   * Remove repository
   */
  const removeRepository = (repoId: string) => {
    setRepositories(prev => prev.filter(repo => repo.id !== repoId));
    setReviews(prev => prev.filter(review => review.repositoryId !== repoId));
  };

  /**
   * Update repository status
   */
  const updateRepositoryStatus = (repoId: string, status: Repository['status']) => {
    setRepositories(prev => 
      prev.map(repo => 
        repo.id === repoId ? { ...repo, status } : repo
      )
    );
  };

  /**
   * Refresh all repositories
   */
  const refreshRepositories = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh process
    setTimeout(() => {
      setRepositories(prev => 
        prev.map(repo => ({
          ...repo,
          lastCommit: Math.random() > 0.5 ? 'just now' : repo.lastCommit,
          qualityScore: Math.max(50, repo.qualityScore + Math.floor(Math.random() * 10) - 5)
        }))
      );
      setIsRefreshing(false);
    }, 2000);
  };

  /**
   * Get status color based on quality score and status
   */
  const getStatusColor = (status: string, score: number) => {
    if (status === 'deployed') return 'bg-green-500';
    if (status === 'deploying') return 'bg-blue-500';
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  /**
   * Get status icon based on repository status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'deploying': return <Rocket className="h-4 w-4" />;
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Sider AI Code Review</h1>
                <p className="text-slate-400 text-sm">Automated Code Quality & Deployment</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={refreshRepositories}
                disabled={isRefreshing}
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-sm overflow-x-auto">
            <TabsTrigger value="dashboard" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Dashboard</span>
              <span className="xs:hidden">Dash</span>
            </TabsTrigger>
            <TabsTrigger value="repositories" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Github className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Repositories</span>
              <span className="xs:hidden">Repos</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Reviews</span>
              <span className="xs:hidden">Rev</span>
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Deployments</span>
              <span className="xs:hidden">Deploy</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">AI Chat</span>
              <span className="xs:hidden">Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Total Repositories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-white">{repositories.length}</div>
                  <p className="text-xs text-slate-400 mt-1">+{repositories.filter(r => r.createdAt > new Date(Date.now() - 30*24*60*60*1000)).length} this month</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Avg Quality Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-green-400">
                    {repositories.length > 0 ? Math.round(repositories.reduce((acc, repo) => acc + repo.qualityScore, 0) / repositories.length) : 0}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Quality trending up</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Active PRs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">
                    {repositories.reduce((acc, repo) => acc + repo.pullRequests, 0)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{repositories.filter(r => r.status === 'reviewing').length} pending review</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-slate-300">Deployments Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">
                    {repositories.filter(r => r.status === 'deployed' || r.status === 'deploying').length}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{repositories.filter(r => r.status === 'deploying').length} in progress</p>
                </CardContent>
              </Card>
            </div>

            {/* Repository Status */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-white">Repository Status</CardTitle>
                    <CardDescription className="text-slate-400">
                      Overview of all connected repositories and their current status
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={refreshRepositories}
                    disabled={isRefreshing}
                    className="sm:hidden"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repositories.map((repo) => (
                    <div key={repo.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(repo.status, repo.qualityScore)} ${repo.isAnalyzing ? 'animate-pulse' : ''}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <h3 className="font-medium text-white truncate">{repo.owner}/{repo.name}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                <GitBranch className="h-3 w-3 mr-1" />
                                {repo.branch}
                              </Badge>
                              {repo.isAnalyzing && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                                  <Bot className="h-3 w-3 mr-1 animate-spin" />
                                  Analyzing...
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-400">Last commit: {repo.lastCommit}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-white">
                              {repo.isAnalyzing ? '...' : `${repo.qualityScore}%`}
                            </span>
                            {!repo.isAnalyzing && getStatusIcon(repo.status)}
                          </div>
                          <p className="text-xs text-slate-400 capitalize">{repo.status}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedRepo(repo)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {repositories.length === 0 && (
                    <div className="text-center py-8">
                      <Github className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No repositories connected yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setActiveTab('repositories')}
                      >
                        Connect Your First Repository
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent AI Reviews</CardTitle>
                <CardDescription className="text-slate-400">
                  Latest code reviews performed by Sider AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600 space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full flex-shrink-0">
                          <Bot className="h-4 w-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                            <h3 className="font-medium text-white truncate">{review.repository}</h3>
                            <Badge variant="outline" className="text-xs w-fit">{review.pullRequest}</Badge>
                          </div>
                          <p className="text-sm text-slate-400">by {review.author} • {review.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-left sm:text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              review.qualityScore >= 85 ? 'text-green-400' : 
                              review.qualityScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {review.qualityScore}%
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {review.suggestions} suggestions
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 capitalize">{review.status}</p>
                        </div>
                        {review.qualityScore < 85 && (
                          <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="text-center py-8">
                      <Bot className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">No reviews available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="repositories">
            <RepositoryManager 
              repositories={repositories} 
              onAddRepository={addRepository}
              onRemoveRepository={removeRepository}
              onUpdateStatus={updateRepositoryStatus}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <CodeReviewPanel reviews={reviews} repositories={repositories} />
          </TabsContent>

          <TabsContent value="deployments">
            <DeploymentPipeline 
              repositories={repositories} 
              onUpdateStatus={updateRepositoryStatus}
            />
          </TabsContent>

          <TabsContent value="chat">
            <AIChat repositories={repositories} reviews={reviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
