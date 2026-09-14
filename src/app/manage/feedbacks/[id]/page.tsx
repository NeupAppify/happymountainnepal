'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFeedback, updateFeedback, addFeedbackEntry, updateFeedbackEntry, Feedback, FeedbackEntry } from '@/lib/db';
import { getTeamMembers } from '@/lib/db/team';
import { TeamMember } from '@/lib/types';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@neup/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Calendar, Send, MessageSquare, CheckSquare, Reply, Circle, Check, Plus, User } from 'lucide-react';
import { Badge } from '@neup/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@neup/components/ui/avatar';
import { Card, CardContent } from "@neup/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@neup/components/ui/tabs";
import { Checkbox } from '@neup/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@neup/components/ui/dialog';

export default function FeedbackDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params?.id as string;

    // Data State
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    // Entry Input State
    const [entryType, setEntryType] = useState<'discussion' | 'task'>('discussion');
    const [newDescription, setNewDescription] = useState('');
    const [newTitle, setNewTitle] = useState(''); // For tasks
    const [newDeadline, setNewDeadline] = useState(''); // For tasks
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI State
    const [showMentionList, setShowMentionList] = useState(false);
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (id) {
            Promise.all([
                loadFeedback(),
                loadTeam()
            ]).finally(() => setLoading(false));
        }
    }, [id]);

    const loadFeedback = async () => {
        try {
            const data = await getFeedback(id);
            if (data) {
                setFeedback(data);
            } else {
                toast({ title: "Error", description: "Feedback not found", variant: "destructive" });
                router.push('/manage/feedbacks');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadTeam = async () => {
        try {
            const members = await getTeamMembers();
            setTeamMembers(members);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateRoot = async (updates: Partial<Feedback>) => {
        if (!feedback) return;
        setFeedback(prev => prev ? { ...prev, ...updates } : null);
        try {
            await updateFeedback(feedback.id, updates);
        } catch (error) {
            console.error("Failed to update", error);
            loadFeedback();
        }
    };

    // Mention Logic
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const cursorValues = e.target.selectionStart;

        // Simple detection for now
        const lastAt = val.lastIndexOf('@', cursorValues);
        if (lastAt !== -1 && lastAt < cursorValues) {
            const query = val.substring(lastAt + 1, cursorValues);
            if (!query.includes(' ')) {
                setShowMentionList(true);
            } else {
                setShowMentionList(false);
            }
        } else {
            setShowMentionList(false);
        }
        setNewDescription(val);
    };

    const insertMention = (name: string) => {
        if (!descriptionInputRef.current) return;
        const val = newDescription;
        const cursor = descriptionInputRef.current.selectionStart;
        const lastAt = val.lastIndexOf('@', cursor);
        const before = val.substring(0, lastAt);
        const after = val.substring(cursor);
        const mention = `@${normalizeName(name)}`;
        const newVal = `${before}${mention} ${after}`;
        setNewDescription(newVal);
        setShowMentionList(false);
        descriptionInputRef.current.focus();
    };

    // Helper for name normalization
    const normalizeName = (name: string) => name.toLowerCase().replace(/\s+/g, '');

    const parseCommands = (text: string) => {
        const result = {
            title: null as string | null,
            description: null as string | null,
            priority: null as 'low' | 'medium' | 'high' | null,
            status: null as 'open' | 'in-progress' | 'completed' | null,
            deadline: null as string | null,
            issuedTo: [] as string[], // IDs
            isRootClose: false,
            isRootUpdate: false
        };

        const lines = text.split('\n').map(l => l.trim());

        // Helper regexes
        const dateAbsFull = /^(\d{4})[-.\s](\d{2})[-.\s](\d{2})$/; // YYYY-MM-DD
        const dateAbsCompact = /^(\d{4})(\d{2})(\d{2})$/; // YYYYMMDD
        const dateYearMonth = /^(\d{4})[-.\s](\d{2})$/; // YYYY-MM
        const dateYear = /^(\d{4})$/; // YYYY
        const dateRel = /^(\d+)\s*(day|week|month|year)s?$/i;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();
            const nextLine = (i + 1 < lines.length) ? lines[i + 1] : "";

            // --- Multi-line Commands ---

            // set.title
            if (lowerLine === 'set.title' && nextLine) {
                result.title = nextLine;
                result.isRootUpdate = true;
                i++; continue;
            }

            // set.description
            if (lowerLine === 'set.description' && nextLine) {
                result.description = nextLine;
                result.isRootUpdate = true;
                i++; continue;
            }

            // set.priority
            if (lowerLine === 'set.priority' && nextLine) {
                const p = nextLine.toLowerCase();
                if (['high'].includes(p)) result.priority = 'high';
                if (['mid', 'medium'].includes(p)) result.priority = 'medium';
                if (['low'].includes(p)) result.priority = 'low';
                result.isRootUpdate = true;
                i++; continue;
            }

            // set.status
            if (lowerLine === 'set.status' && nextLine) {
                const s = nextLine.toLowerCase();
                if (['open', 'reopen'].includes(s)) result.status = 'open';
                if (['started', 'ongoing', 'start'].includes(s)) result.status = 'in-progress';
                if (['completed', 'cancelled', 'failed'].includes(s)) result.status = 'completed';
                result.isRootUpdate = true; // Status often implies root unless context says otherwise
                i++; continue;
            }

            // set.deadline
            if (lowerLine === 'set.deadline' && nextLine) {
                const d = nextLine.trim();
                let date: Date | null = null;
                const now = new Date();

                if (dateRel.test(d)) {
                    const m = d.match(dateRel)!;
                    const val = parseInt(m[1]);
                    const unit = m[2].toLowerCase();
                    if (unit === 'day') date = new Date(now.setDate(now.getDate() + val));
                    if (unit === 'week') date = new Date(now.setDate(now.getDate() + (val * 7)));
                    if (unit === 'month') date = new Date(now.setMonth(now.getMonth() + val));
                    if (unit === 'year') date = new Date(now.setFullYear(now.getFullYear() + val));
                } else if (dateAbsFull.test(d)) {
                    const m = d.match(dateAbsFull)!;
                    date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
                } else if (dateAbsCompact.test(d)) {
                    const m = d.match(dateAbsCompact)!;
                    date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
                } else if (dateYearMonth.test(d)) {
                    const m = d.match(dateYearMonth)!;
                    date = new Date(parseInt(m[1]), parseInt(m[2]) - 1, 1);
                } else if (dateYear.test(d)) {
                    const m = d.match(dateYear)!;
                    date = new Date(parseInt(m[1]), 0, 1);
                }

                if (date && !isNaN(date.getTime())) {
                    result.deadline = date.toISOString();
                }
                i++; continue;
            }

            // issue.user (Multi-line)
            if (lowerLine === 'issue.user' && nextLine) {
                const names = nextLine.split(',').map(n => n.trim().toLowerCase().replace('@', '').replace(/\s+/g, ''));
                names.forEach(targetName => {
                    const member = teamMembers.find(m => normalizeName(m.name) === targetName);
                    if (member) result.issuedTo.push(member.id);
                });
                result.isRootUpdate = true;
                i++; continue;
            }

            // issue.username (Inline)
            if (lowerLine.startsWith('issue.') && lowerLine !== 'issue.user') {
                const targetName = lowerLine.replace('issue.', '').trim().replace('@', '').replace(/\s+/g, '');
                if (targetName) {
                    const member = teamMembers.find(m => normalizeName(m.name) === targetName);
                    if (member) {
                        result.issuedTo.push(member.id);
                        result.isRootUpdate = true;
                    }
                }
            }
        }

        // --- Legacy Hash Commands (Backwards Compat + Inline Convenience) ---

        // Priority
        if (/#(priority|prior|priorrity)[.]?high/i.test(text)) result.priority = 'high';
        else if (/#(priority|prior|priorrity)[.]?(medium|mid)/i.test(text)) result.priority = 'medium';
        else if (/#(priority|prior|priorrity)[.]?low/i.test(text)) result.priority = 'low';

        // Status
        if (/#(closed|case[.]?close)/i.test(text)) {
            result.isRootClose = true;
            result.status = 'completed';
        }
        if (/#task[.]?close/i.test(text) && !result.status) result.status = 'completed'; // Don't override strict set.status
        if (/#task[.]?open/i.test(text) && !result.status) result.status = 'open';

        // Legacy Deadline
        const deadlineMatch = text.match(/#deadline[.]?(\d{8})/i);
        const deadlineRelMatch = text.match(/#deadline[.]?(\d+)\s*days?/i);

        if (deadlineMatch && !result.deadline) {
            const dateStr = deadlineMatch[1];
            result.deadline = new Date(parseInt(dateStr.substring(0, 4)), parseInt(dateStr.substring(4, 6)) - 1, parseInt(dateStr.substring(6, 8))).toISOString();
        } else if (deadlineRelMatch && !result.deadline) {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(deadlineRelMatch[1]));
            result.deadline = date.toISOString();
        }

        return result;
    };

    const handleEntrySubmit = async () => {
        if (!newDescription.trim() && entryType === 'discussion') return;
        if (!newTitle.trim() && entryType === 'task') return;
        if (!feedback) return;

        setIsSubmitting(true);
        try {
            const textToParse = entryType === 'discussion' ? newDescription : (newDescription + " " + newTitle);
            const commands = parseCommands(textToParse);

            // Determine Targets
            let newEntryDeadline = undefined;
            if (entryType === 'task' && newDeadline) newEntryDeadline = newDeadline; // Manual override

            // Updates Containers
            const rootUpdates: Partial<Feedback> = {};
            const parentUpdates: Partial<FeedbackEntry> = {};
            let selfStatus: 'open' | 'in-progress' | 'completed' | undefined = entryType === 'task' ? 'open' : undefined;

            // 1. Root Properties (Title, Desc, Priority, IssuedTo)
            if (commands.priority) rootUpdates.priority = commands.priority;
            if (commands.title) rootUpdates.title = commands.title;
            if (commands.description) rootUpdates.description = commands.description;
            if (commands.issuedTo.length > 0) {
                // Merge distinct
                const current = feedback.issuedTo || [];
                const merged = [...new Set([...current, ...commands.issuedTo])];
                rootUpdates.issuedTo = merged;
            }

            // 2. Deadline (Contextual)
            if (commands.deadline) {
                if (entryType === 'task') {
                    newEntryDeadline = commands.deadline;
                } else if (replyingTo) {
                    const parent = feedback.entries.find(e => e.id === replyingTo);
                    if (parent && parent.type === 'task') {
                        parentUpdates.deadline = commands.deadline;
                    } else {
                        rootUpdates.deadline = commands.deadline;
                    }
                } else {
                    rootUpdates.deadline = commands.deadline;
                }
            }

            // 3. Status (Contextual)
            if (commands.isRootClose) {
                rootUpdates.status = 'completed';
            } else if (commands.isRootUpdate && commands.status) {
                // Explicit set.status often implies root or self?
                // If typing "set.status completed" in a comment, likely means root case status.
                // Unless replying to a task.
                if (replyingTo) {
                    const parent = feedback.entries.find(e => e.id === replyingTo);
                    if (parent && parent.type === 'task') parentUpdates.status = commands.status;
                    else rootUpdates.status = (commands.status as any);
                } else {
                    rootUpdates.status = (commands.status as any);
                }
            } else if (commands.status) {
                // Legacy hash commands handling (#task.close etc)
                if (replyingTo) {
                    const parent = feedback.entries.find(e => e.id === replyingTo);
                    if (parent && parent.type === 'task') {
                        parentUpdates.status = commands.status;
                    }
                } else if (entryType === 'task') {
                    selfStatus = commands.status;
                }
            }

            // Construct Entry
            const entry: FeedbackEntry = {
                id: crypto.randomUUID(),
                type: entryType,
                title: entryType === 'task' ? newTitle : undefined,
                description: newDescription,
                createdAt: new Date().toISOString(),
                createdBy: 'Admin',
                status: selfStatus,
                deadline: newEntryDeadline,
                parentId: replyingTo
            };

            await addFeedbackEntry(feedback.id, entry);

            // Execute Side Effects
            const promises = [];

            if (Object.keys(rootUpdates).length > 0) {
                promises.push(handleUpdateRoot(rootUpdates));
            }

            if (Object.keys(parentUpdates).length > 0 && replyingTo) {
                promises.push(updateFeedbackEntry(feedback.id, replyingTo, parentUpdates));
                setFeedback(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        entries: prev.entries.map(e => e.id === replyingTo ? { ...e, ...parentUpdates } : e)
                    };
                });
            }

            await Promise.all(promises);

            setFeedback(prev => prev ? {
                ...prev,
                entries: [...prev.entries, entry],
                ...rootUpdates
            } : null);

            setNewDescription('');
            setNewTitle('');
            setNewDeadline('');
            setReplyingTo(null);

            toast({ title: "Posted", description: Object.keys(commands).length > 4 ? "Updates applied via commands." : undefined });
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to process entry", variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleEntryStatus = async (entryId: string, currentStatus?: string) => {
        if (!feedback) return;
        const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
        const updatedEntries = feedback.entries.map(e =>
            e.id === entryId ? { ...e, status: newStatus as any } : e
        );
        setFeedback({ ...feedback, entries: updatedEntries });
        try {
            await updateFeedbackEntry(feedback.id, entryId, { status: newStatus as any });
        } catch (error) {
            console.error(error);
            loadFeedback();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'in-progress': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const sortedEntries = feedback?.entries.sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) || [];

    // Helper to separate root discussions from sub-threads vs chronological stream
    // User requested "all subtasks will also be updates". Chronological is best.

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!feedback) return null;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/manage/feedbacks')} className="-ml-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Feedbacks
                    </Button>
                </div>

                {/* Main Card */}
                <Card className="shadow-sm border-none bg-white dark:bg-gray-800">
                    <div className="p-6 space-y-6">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                                <Badge className={`${getPriorityColor(feedback.priority || 'medium')}`}>
                                    {feedback.priority}
                                </Badge>
                                <Badge className={`${getStatusColor(feedback.status || 'open')}`}>
                                    {feedback.status}
                                </Badge>
                            </div>

                            {/* Issued To Display Only */}
                            {feedback.issuedTo && feedback.issuedTo.length > 0 && (
                                <div className="flex -space-x-2">
                                    {feedback.issuedTo.map(id => {
                                        const m = teamMembers.find(tm => tm.id === id);
                                        if (!m) return null;
                                        return (
                                            <Avatar key={id} className="w-8 h-8 border-2 border-white ring-0">
                                                <AvatarImage src={m.image} />
                                                <AvatarFallback className="text-xs">{m.name[0]}</AvatarFallback>
                                            </Avatar>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Title & Description Read Only */}
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold">{feedback.title}</h1>
                            {feedback.description && (
                                <div className="text-base text-muted-foreground whitespace-pre-wrap">
                                    {feedback.description}
                                </div>
                            )}
                        </div>

                        {/* Metadata Footer */}
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-t pt-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs uppercase tracking-wide">Issued On</span>
                                {new Date(feedback.createdAt as string).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs uppercase tracking-wide">Deadline</span>
                                {feedback.deadline ? new Date(feedback.deadline as string).toLocaleDateString() : 'N/A'}
                            </div>
                            {feedback.issuedTo && feedback.issuedTo.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs uppercase tracking-wide">Assignees</span>
                                    <div className="flex flex-wrap gap-1">
                                        {feedback.issuedTo.map(id => {
                                            const m = teamMembers.find(tm => tm.id === id);
                                            return m ? <span key={id} className="bg-secondary px-1.5 py-0.5 rounded text-xs">{m.name}</span> : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Subtasks and Updates Section */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        Activity & Subtasks
                    </h2>

                    {/* Input Area */}
                    <Card className="border shadow-sm overflow-visible">
                        <Tabs value={entryType} onValueChange={(v) => setEntryType(v as any)} className="w-full">
                            <div className="flex items-center justify-between px-4 pt-4">
                                <TabsList>
                                    <TabsTrigger value="discussion" className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Comment
                                    </TabsTrigger>
                                    <TabsTrigger value="task" className="flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" /> Subtask
                                    </TabsTrigger>
                                </TabsList>
                                {replyingTo && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded text-blue-600">
                                        Replying to thread
                                        <button onClick={() => setReplyingTo(null)} className="hover:text-red-500"><Circle className="w-3 h-3 fill-current" /></button>
                                    </div>
                                )}
                            </div>

                            <CardContent className="pt-4 space-y-4">
                                <TabsContent value="task" className="mt-0 space-y-3">
                                    <Input
                                        placeholder="Task Title"
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="font-medium"
                                    />
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">Deadline:</label>
                                        <Input
                                            type="date"
                                            value={newDeadline}
                                            onChange={(e) => setNewDeadline(e.target.value)}
                                            className="w-auto"
                                        />
                                    </div>
                                </TabsContent>

                                <div className="relative">
                                    <Textarea
                                        ref={descriptionInputRef}
                                        placeholder={entryType === 'task' ? "Task details..." : "Leave a comment... (Type @ to mention)"}
                                        value={newDescription}
                                        onChange={handleDescriptionChange}
                                        className="min-h-[100px]"
                                    />
                                    {showMentionList && (
                                        <div className="absolute top-full left-0 mt-1 w-48 bg-popover text-popover-foreground border rounded-md shadow-md z-10 max-h-[200px] overflow-auto p-1">
                                            {teamMembers.map(m => (
                                                <div
                                                    key={m.id}
                                                    className="px-2 py-1.5 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm rounded-sm flex items-center gap-2"
                                                    onClick={() => insertMention(m.name)}
                                                >
                                                    <Avatar className="w-4 h-4">
                                                        <AvatarImage src={m.image} />
                                                        <AvatarFallback className="text-[8px]">{m.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    {m.name}
                                                </div>
                                            ))}
                                            {teamMembers.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No members found</div>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between pt-2 items-center">
                                    <div className="text-xs text-muted-foreground">
                                        {entryType === 'discussion' && "Use @ to mention team members."}
                                    </div>
                                    <Button onClick={handleEntrySubmit} size="sm" disabled={isSubmitting}>
                                        {isSubmitting ? 'Saving...' : (entryType === 'task' ? 'Add Subtask' : 'Post Comment')}
                                        <Send className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Tabs>
                    </Card>

                    {/* Stream */}
                    <div className="space-y-4">
                        {sortedEntries.map((entry) => (
                            <div key={entry.id} className={`flex gap-3 ${entry.parentId ? 'ml-8 md:ml-12 border-l-2 border-dashed border-slate-200 pl-4 py-1' : ''}`}>
                                <Avatar className="w-8 h-8 mt-1 border">
                                    <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                                        {entry.createdBy ? entry.createdBy[0].toUpperCase() : 'A'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-grow space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{entry.createdBy || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                                </span>
                                                {entry.type === 'task' && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 bg-slate-50">Task</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setReplyingTo(entry.id)}>
                                            <Reply className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    {/* Entry Card/Bubble */}
                                    <div className={`p-4 rounded-lg border ${entry.type === 'task'
                                        ? 'bg-slate-50/50 dark:bg-slate-900/30'
                                        : 'bg-white dark:bg-card shadow-sm border-none ring-1 ring-slate-100 dark:ring-slate-800'
                                        }`}>
                                        {entry.type === 'task' ? (
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    checked={entry.status === 'completed'}
                                                    onCheckedChange={() => toggleEntryStatus(entry.id, entry.status)}
                                                    className="mt-1"
                                                />
                                                <div className="space-y-1 w-full">
                                                    <div className={`font-medium text-sm leading-relaxed ${entry.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                        {entry.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.description}</div>

                                                    {entry.deadline && (
                                                        <div className="flex items-center gap-2 text-xs pt-2 mt-2 text-orange-600 font-medium">
                                                            <Calendar className="w-3 h-3" />
                                                            Due: {new Date(entry.deadline).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                                {entry.description}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
