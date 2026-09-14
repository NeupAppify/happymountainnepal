
'use client';

import { useEffect, useState } from 'react';
import { getInquiries, Inquiry } from '@/lib/db';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@neup/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@neup/components/ui/card';
import { Badge } from '@neup/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Mail, MessageSquare, Briefcase } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@neup/components/ui/accordion"

function InquiryRow({ inquiry }: { inquiry: Inquiry }) {
    const createdAt = inquiry.createdAt ? formatDistanceToNow(new Date(inquiry.createdAt as any), { addSuffix: true }) : 'N/A';

    const getPrimaryContact = () => {
        if (inquiry.type === 'customization') {
            const initialUserMessage = inquiry.conversation?.find(c => c.role === 'user')?.text || '';
            const contactInfoMatch = initialUserMessage.match(/Contact Info: (.+)/);
            return contactInfoMatch ? contactInfoMatch[1] : 'Not provided';
        }
        if (inquiry.type === 'booking') {
            return inquiry.data?.email || inquiry.data?.name || 'N/A';
        }
        return inquiry.data?.email || inquiry.data?.name || 'N/A';
    };

    const getInquiryType = () => {
        switch(inquiry.type) {
            case 'customization': return { icon: <MessageSquare className="h-3 w-3" />, label: 'AI Custom Trip' };
            case 'booking': return { icon: <Briefcase className="h-3 w-3" />, label: 'Booking Request' };
            case 'contact': return { icon: <Mail className="h-3 w-3" />, label: 'Contact Form' };
            default: return { icon: <Mail className="h-3 w-3" />, label: 'Inquiry' };
        }
    }

    const { icon, label } = getInquiryType();

    return (
        <AccordionItem value={inquiry.id}>
            <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4 text-left">
                        <div className="font-medium truncate">{getPrimaryContact()}</div>
                        <Badge variant={inquiry.type === 'booking' ? 'default' : 'secondary'} className="hidden sm:inline-flex items-center gap-1.5">
                            {icon}
                            {label}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground hidden md:block">
                        {createdAt}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="p-4 bg-secondary/50 rounded-md">
                     {inquiry.type === 'customization' ? (
                        inquiry.conversation?.map((message, index) => (
                            <div key={index} className={`mb-3 ${message.role === 'user' ? 'text-foreground' : 'text-muted-foreground'}`}>
                                <span className="font-bold capitalize">{message.role}:</span>
                                <p className="ml-2 whitespace-pre-wrap">{message.text}</p>
                            </div>
                        ))
                     ) : inquiry.type === 'booking' ? (
                        <div className="space-y-4">
                            <div><strong className="font-semibold">Base Package:</strong> {inquiry.data?.basePackageId}</div>
                            <div><strong className="font-semibold">Name:</strong> {inquiry.data?.name}</div>
                            <div><strong className="font-semibold">Contact:</strong> {inquiry.data?.email} {inquiry.data?.phone && `| ${inquiry.data?.phone}`}</div>
                            <div><strong className="font-semibold">Country:</strong> {inquiry.data?.country}</div>
                            {inquiry.data?.customizationNotes && <div><strong className="font-semibold">Notes:</strong><p className="whitespace-pre-wrap mt-1">{inquiry.data.customizationNotes}</p></div>}
                            
                            <div className="pt-2 border-t mt-2">
                                <h4 className="font-semibold mb-2">Custom Itinerary:</h4>
                                <ul className="space-y-2">
                                    {inquiry.data?.itinerary?.map((item: { day: number; title: string; description: string }, i: number) => (
                                        <li key={i} className="text-sm border-l-2 pl-3">
                                            <p className="font-bold">Day {item.day}: {item.title}</p>
                                            <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           <div><strong>From:</strong> {inquiry.data?.name} &lt;{inquiry.data?.email}&gt;</div>
                           <div><strong>Subject:</strong> {inquiry.data?.subject}</div>
                           <div className="pt-2 border-t mt-2">
                            <p className="whitespace-pre-wrap">{inquiry.data?.message}</p>
                           </div>
                        </div>
                     )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}


export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const fetchedInquiries = await getInquiries();
        setInquiries(fetchedInquiries);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load inquiries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
          <CardDescription>
            Here are the latest trip planning requests from customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Inquiries</CardTitle>
        <CardDescription>
          Here are the latest trip planning requests from customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inquiries.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {inquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Inquiries Yet</h3>
            <p>New inquiries will appear here as they are submitted.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
