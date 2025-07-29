/**
 * Repository management component for connecting and managing GitHub repositories
 * Handles GitHub integration and repository configuration
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Github, 
  Plus, 
  Settings, 
  GitBranch, 
  Star, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Bot
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

interface RepositoryManagerProps {
  repositories: Repository[];
  onAddRepository: (url: string) => Promise<boolean>;
  onRemoveRepository: (id: string) => void;
  onUpdateStatus: (id: string, status: Repository['status']) => void;
}

export default function RepositoryManager({ 
  repositories, 
  onAddRepository, 
  onRemoveRepository, 
  onUpdateStatus 
}: RepositoryManagerProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [autoReview, setAutoReview] = useState(true);
  const [minQualityScore, setMinQualityScore] = useState(85);
  const [connectionError, setConnectionError] = useState('');

  /**
   * Handle connecting a new repository
   */
  const handleConnectRepo = async () => {
    if (!newRepoUrl.trim()) return;
    
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      const success = await onAddRepository(newRepoUrl);
      if (success) {
        setNewRepoUrl('');
      } else {
        setConnectionError('Failed to connect repository. Please check the URL and try again.');
      }
    } catch (error) {
      setConnectionError('Invalid repository URL or connection failed.');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Handle repository deletion
   */
  const handleDeleteRepo = (repo: Repository) => {
    if (window.confirm(`Are you sure you want to disconnect ${repo.owner}/${repo.name}?`)) {
      onRemoveRepository(repo.id);
    }
  };

  /**
   * Trigger manual review
   */
  const triggerManualReview = (repoId: string) => {
    onUpdateStatus(repoId, 'reviewing');
    // Simulate review process
    setTimeout(() => {
      const newScore = Math.floor(Math.random() * 40) + 60;
      const newStatus = newScore >= 85 ? 'approved' : newScore >= 70 ? 'reviewing' : 'rejected';
      onUpdateStatus(repoId, newStatus);
    }, 3000);
  };

  /**
   * Get status icon based on repository status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'deploying': return <Clock className="h-4 w-4 text-blue-400" />;
      case 'deployed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Github className="h-5 w-5" />
                <span>GitHub Integration</span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Connect and manage your GitHub repositories
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-green-400 border-green-400 w-fit">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Repository */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Add New Repository</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Input
                placeholder="https://github.com/username/repository"
                value={newRepoUrl}
                onChange={(e) => {
                  setNewRepoUrl(e.target.value);
                  setConnectionError('');
                }}
                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button 
                onClick={handleConnectRepo}
                disabled={isConnecting || !newRepoUrl.trim()}
                className="bg-purple-600 hover:bg-purple-700 sm:w-auto w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
            {connectionError && (
              <p className="text-red-400 text-sm">{connectionError}</p>
            )}
            <p className="text-sm text-slate-400">
              💡 Enter a GitHub repository URL to start automated code reviews and deployments
            </p>
          </div>

          {/* Settings */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <h3 className="text-lg font-medium text-white">Review Settings</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white">Auto Review</Label>
                  <p className="text-sm text-slate-400">
                    Automatically review new pull requests
                  </p>
                </div>
                <Switch
                  checked={autoReview}
                  onCheckedChange={setAutoReview}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">
                  Minimum Quality Score for Deployment: {minQualityScore}%
                </Label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={minQualityScore}
                  onChange={(e) => setMinQualityScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${minQualityScore}%, #475569 ${minQualityScore}%, #475569 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Repository List */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Connected Repositories ({repositories.length})</CardTitle>
          <CardDescription className="text-slate-400">
            Manage your connected repositories and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositories.length === 0 ? (
            <div className="text-center py-12">
              <Github className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No repositories connected</h3>
              <p className="text-slate-400 mb-6">Connect your first GitHub repository to get started with AI-powered code reviews</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {repositories.map((repo) => (
                <Card key={repo.id} className="bg-slate-700/30 border-slate-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Github className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <CardTitle className="text-white text-base truncate">
                          {repo.owner}/{repo.name}
                        </CardTitle>
                        {repo.isAnalyzing && (
                          <Bot className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getStatusIcon(repo.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                          onClick={() => handleDeleteRepo(repo)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-slate-400">
                        <GitBranch className="h-3 w-3" />
                        <span>{repo.branch}</span>
                      </div>
                      <span className="text-slate-400">{repo.lastCommit}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-slate-400">
                          <Star className="h-3 w-3" />
                          <span>Quality: {repo.isAnalyzing ? '...' : `${repo.qualityScore}%`}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-slate-400">
                          <Users className="h-3 w-3" />
                          <span>{repo.pullRequests} PRs</span>
                        </div>
                      </div>
                      <Badge 
                        variant={repo.qualityScore >= 85 ? "default" : "destructive"}
                        className={`text-xs ${
                          repo.qualityScore >= 85 ? "bg-green-600" : 
                          repo.qualityScore >= 70 ? "bg-yellow-600" : "bg-red-600"
                        }`}
                      >
                        {repo.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => triggerManualReview(repo.id)}
                        disabled={repo.isAnalyzing}
                      >
                        <Bot className="h-3 w-3 mr-1" />
                        {repo.isAnalyzing ? 'Analyzing...' : 'Review'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => window.open(repo.url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        GitHub
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>

                    {repo.qualityScore < 85 && !repo.isAnalyzing && (
                      <div className="flex items-center space-x-2 text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span>Quality score below deployment threshold ({minQualityScore}%)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Webhooks */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Webhook Configuration</CardTitle>
          <CardDescription className="text-slate-400">
            Automated triggers for code review and deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-white">Pull Request</h3>
              </div>
              <p className="text-sm text-slate-400">
                Triggers AI review on new PRs
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-white">Push</h3>
              </div>
              <p className="text-sm text-slate-400">
                Triggers quality check on commits
              </p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <h3 className="font-medium text-white">Deployment</h3>
              </div>
              <p className="text-sm text-slate-400">
                Auto-deploy on quality approval
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
