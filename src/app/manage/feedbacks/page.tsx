'use client';

import { useState, useEffect } from 'react';
import { getFeedbacks, Feedback } from '@/lib/db';
import { getTeamMembers } from '@/lib/db/team';
import type { TeamMember } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@neup/components/ui/card';
import { Plus, Calendar, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { LinkButton } from "@neup/components/ui/link-button";
import { Badge } from '@neup/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@neup/components/ui/avatar';

export default function FeedbacksPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [fbData, tmData] = await Promise.all([
                getFeedbacks(20),
                getTeamMembers()
            ]);
            setFeedbacks(fbData);
            setTeamMembers(tmData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusIcon = (status: Feedback['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'in-progress': return <AlertCircle className="w-4 h-4 text-orange-500" />;
            default: return <Circle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: Feedback['priority']) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Feedbacks & Tasks</h1>
                    <p className="text-muted-foreground">Manage ongoing site issues and tasks.</p>
                </div>
                <LinkButton href="/manage/feedbacks/create" variant="solid">
                        <Plus className="w-4 h-4 mr-2" />
                        New Feedback
                    </LinkButton>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="opacity-50 animate-pulse">
                            <CardHeader className="h-24 bg-gray-100 dark:bg-gray-800 rounded-t-lg" />
                            <CardContent className="h-32" />
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {feedbacks.map((feedback) => (
                        <LinkButton href={`/manage/feedbacks/${feedback.id}`} key={feedback.id} className="block transition-transform hover:scale-[1.02]">
                            <Card className="h-full flex flex-col cursor-pointer border-l-4" style={{
                                borderLeftColor: feedback.priority === 'high' ? 'red' : feedback.priority === 'medium' ? 'blue' : 'gray'
                            }}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getPriorityColor(feedback.priority)} className="uppercase text-[10px]">
                                                {feedback.priority}
                                            </Badge>
                                            <div className="text-muted-foreground">
                                                {getStatusIcon(feedback.status)}
                                            </div>
                                        </div>

                                        {feedback.issuedTo && feedback.issuedTo.length > 0 && (
                                            <div className="flex -space-x-2">
                                                {feedback.issuedTo.map(id => {
                                                    const m = teamMembers.find(tm => tm.id === id);
                                                    if (!m) return null;
                                                    return (
                                                        <Avatar key={id} className="w-6 h-6 border-2 border-white ring-0">
                                                            <AvatarImage src={m.image} />
                                                            <AvatarFallback className="text-[9px]">{m.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="leading-tight mt-2 text-lg line-clamp-2">
                                        {feedback.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {feedback.description || "No description provided."}
                                    </p>
                                    {feedback.entries && feedback.entries.filter(e => e.type === 'task').length > 0 && (
                                        <div className="mt-4 text-xs font-medium text-muted-foreground">
                                            {feedback.entries.filter(e => e.type === 'task' && e.status === 'completed').length} / {feedback.entries.filter(e => e.type === 'task').length} tasks
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="pt-2 text-xs text-muted-foreground border-t flex justify-between items-center">
                                    <div>
                                        {formatDistanceToNow(new Date(feedback.createdAt as string), { addSuffix: true })}
                                    </div>
                                    {feedback.deadline && (
                                        <div className="flex items-center text-orange-600">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(feedback.deadline as string).toLocaleDateString()}
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        </LinkButton>
                    ))}
                    {feedbacks.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <p>No active tasks found. Create one to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
