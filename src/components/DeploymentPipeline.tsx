/**
 * Deployment pipeline component showing CI/CD status and automated deployments
 * Handles deployment triggers based on quality scores and pipeline management
 */
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause,
  GitBranch,
  Server,
  Globe,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Square
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

interface DeploymentPipelineProps {
  repositories: Repository[];
  onUpdateStatus: (id: string, status: Repository['status']) => void;
}

interface Pipeline {
  id: string;
  repository: string;
  repositoryId: string;
  branch: string;
  stage: 'build' | 'test' | 'security' | 'deploy' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  duration: string;
  qualityGate: boolean;
  environment: 'staging' | 'production';
}

export default function DeploymentPipeline({ repositories, onUpdateStatus }: DeploymentPipelineProps) {
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      repository: 'react-dashboard',
      repositoryId: '1',
      branch: 'main',
      stage: 'completed',
      progress: 100,
      startTime: '2h ago',
      duration: '4m 32s',
      qualityGate: true,
      environment: 'production'
    },
    {
      id: '2',
      repository: 'api-service',
      repositoryId: '2',
      branch: 'feature/auth',
      stage: 'deploy',
      progress: 75,
      startTime: '15m ago',
      duration: '3m 45s',
      qualityGate: true,
      environment: 'staging'
    },
    {
      id: '3',
      repository: 'mobile-app',
      repositoryId: '3',
      branch: 'develop',
      stage: 'failed',
      progress: 45,
      startTime: '1h ago',
      duration: '2m 15s',
      qualityGate: false,
      environment: 'staging'
    }
  ]);

  /**
   * Get stage icon based on pipeline stage
   */
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'deploy': return <Rocket className="h-4 w-4 text-blue-400" />;
      default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  /**
   * Get stage color based on pipeline stage
   */
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'deploy': return 'text-blue-400';
      default: return 'text-yellow-400';
    }
  };

  /**
   * Trigger manual deployment
   */
  const triggerDeployment = (repo: Repository, environment: 'staging' | 'production') => {
    if (repo.qualityScore < 85) {
      alert('Cannot deploy: Quality score must be ≥85%');
      return;
    }

    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      repository: repo.name,
      repositoryId: repo.id,
      branch: repo.branch,
      stage: 'build',
      progress: 0,
      startTime: 'just now',
      duration: '0s',
      qualityGate: true,
      environment
    };

    setPipelines(prev => [newPipeline, ...prev]);
    onUpdateStatus(repo.id, 'deploying');

    // Simulate pipeline stages
    const stages = ['build', 'test', 'security', 'deploy', 'completed'] as const;
    let currentStageIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      if (progress >= 100) {
        progress = 100;
        currentStageIndex = stages.length - 1;
        onUpdateStatus(repo.id, 'deployed');
        clearInterval(interval);
      } else {
        currentStageIndex = Math.floor((progress / 100) * (stages.length - 1));
      }

      setPipelines(prev => 
        prev.map(p => 
          p.id === newPipeline.id 
            ? { 
                ...p, 
                stage: stages[currentStageIndex],
                progress: Math.round(progress),
                duration: `${Math.floor(progress / 10)}m ${Math.floor((progress % 10) * 6)}s`
              }
            : p
        )
      );
    }, 1000);
  };

  /**
   * Cancel deployment
   */
  const cancelDeployment = (pipelineId: string) => {
    setPipelines(prev => 
      prev.map(p => 
        p.id === pipelineId && p.stage !== 'completed' && p.stage !== 'failed'
          ? { ...p, stage: 'failed' as const, progress: p.progress }
          : p
      )
    );
  };

  /**
   * Retry failed deployment
   */
  const retryDeployment = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      const repo = repositories.find(r => r.id === pipeline.repositoryId);
      if (repo) {
        triggerDeployment(repo, pipeline.environment);
      }
    }
  };

  const activePipelines = pipelines.filter(p => p.stage !== 'completed' && p.stage !== 'failed');

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Rocket className="h-5 w-5 text-blue-400" />
            <span>Deployment Pipeline</span>
          </CardTitle>
          <CardDescription className="text-slate-400">
            Automated CI/CD pipeline with quality-gate controlled deployments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Deployments</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{pipelines.length}</p>
                </div>
                <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {pipelines.length > 0 ? Math.round((pipelines.filter(p => p.stage === 'completed').length / pipelines.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Success rate</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Duration</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">3m 42s</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Build to deploy</p>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Pipelines</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-400">{activePipelines.length}</p>
                </div>
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Currently running</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Pipelines */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Pipeline History</CardTitle>
          <CardDescription className="text-slate-400">
            Real-time status of deployment pipelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pipelines.length === 0 ? (
              <div className="text-center py-12">
                <Rocket className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No deployments yet</h3>
                <p className="text-slate-400">Trigger your first deployment from the repositories below</p>
              </div>
            ) : (
              pipelines.map((pipeline) => (
                <div 
                  key={pipeline.id} 
                  className="p-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-all cursor-pointer"
                  onClick={() => setSelectedPipeline(pipeline)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-full flex-shrink-0">
                        {getStageIcon(pipeline.stage)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <h3 className="font-medium text-white truncate">{pipeline.repository}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                              <GitBranch className="h-3 w-3" />
                              <span>{pipeline.branch}</span>
                            </Badge>
                            <Badge 
                              className={`text-xs ${
                                pipeline.environment === 'production' ? 'bg-red-600' : 'bg-blue-600'
                              }`}
                            >
                              {pipeline.environment}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm text-slate-400">
                          <span>Started {pipeline.startTime}</span>
                          <span>Duration: {pipeline.duration}</span>
                          {!pipeline.qualityGate && (
                            <div className="flex items-center space-x-1 text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Quality gate failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-4">
                      <div className="text-left sm:text-right">
                        <div className={`text-lg font-bold capitalize ${getStageColor(pipeline.stage)}`}>
                          {pipeline.stage}
                        </div>
                        <p className="text-xs text-slate-400">{pipeline.progress}% complete</p>
                      </div>
                      {(pipeline.stage !== 'completed' && pipeline.stage !== 'failed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelDeployment(pipeline.id);
                          }}
                          className="text-xs"
                        >
                          <Square className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {pipeline.stage === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryDeployment(pipeline.id);
                          }}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white">{pipeline.progress}%</span>
                    </div>
                    <Progress value={pipeline.progress} className="h-2" />
                  </div>

                  {/* Pipeline Stages */}
                  <div className="flex items-center justify-between mt-4 overflow-x-auto">
                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
                      {['build', 'test', 'security', 'deploy'].map((stage, index) => (
                        <React.Fragment key={stage}>
                          <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded whitespace-nowrap ${
                            pipeline.stage === stage ? 'bg-blue-600 text-white' :
                            ['build', 'test', 'security', 'deploy'].indexOf(pipeline.stage) > index || pipeline.stage === 'completed' ? 
                            'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'
                          }`}>
                            <span className="capitalize">{stage}</span>
                          </div>
                          {index < 3 && <ArrowRight className="h-3 w-3 text-slate-400 flex-shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Repository Deployment Controls */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Repository Deployment Status</CardTitle>
          <CardDescription className="text-slate-400">
            Manual deployment controls and quality gate status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {repositories.length === 0 ? (
            <div className="text-center py-12">
              <Server className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No repositories available</h3>
              <p className="text-slate-400">Connect repositories to start deploying</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <Card key={repo.id} className="bg-slate-700/30 border-slate-600">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base truncate">
                        {repo.owner}/{repo.name}
                      </CardTitle>
                      <Badge 
                        variant={repo.qualityScore >= 85 ? "default" : "destructive"}
                        className={`${repo.qualityScore >= 85 ? "bg-green-600" : "bg-red-600"} text-xs`}
                      >
                        {repo.qualityScore}% Quality
                      </Badge>
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Deployment Readiness</span>
                        <span className={`text-sm font-medium ${
                          repo.qualityScore >= 85 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {repo.qualityScore >= 85 ? 'Ready' : 'Blocked'}
                        </span>
                      </div>
                      <Progress 
                        value={repo.qualityScore} 
                        className={`h-2 ${repo.qualityScore >= 85 ? '' : 'opacity-50'}`} 
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-400 capitalize">{repo.status}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={repo.qualityScore < 85 || repo.isAnalyzing}
                          onClick={() => triggerDeployment(repo, 'staging')}
                          className="text-xs"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Deploy Staging
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={repo.qualityScore < 85 || repo.isAnalyzing}
                          onClick={() => triggerDeployment(repo, 'production')}
                          className="text-xs"
                        >
                          <Rocket className="h-3 w-3 mr-1" />
                          Deploy Prod
                        </Button>
                      </div>
                    </div>

                    {repo.qualityScore < 85 && !repo.isAnalyzing && (
                      <div className="flex items-start space-x-2 text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>Quality score must be ≥85% for deployment. Current issues need to be resolved.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environment Status */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Environment Status</CardTitle>
          <CardDescription className="text-slate-400">
            Current status of deployment environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Staging</h3>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Deployments</span>
                  <span className="text-white">{pipelines.filter(p => p.environment === 'staging' && (p.stage !== 'completed' && p.stage !== 'failed')).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">CPU Usage</span>
                  <span className="text-green-400">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Memory Usage</span>
                  <span className="text-green-400">62%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Last Deploy</span>
                  <span className="text-white">
                    {pipelines.find(p => p.environment === 'staging')?.startTime || 'Never'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Production</h3>
                <Badge className="bg-green-600">Healthy</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Deployments</span>
                  <span className="text-white">{pipelines.filter(p => p.environment === 'production' && (p.stage !== 'completed' && p.stage !== 'failed')).length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">CPU Usage</span>
                  <span className="text-green-400">23%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Memory Usage</span>
                  <span className="text-green-400">41%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Last Deploy</span>
                  <span className="text-white">
                    {pipelines.find(p => p.environment === 'production')?.startTime || 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
