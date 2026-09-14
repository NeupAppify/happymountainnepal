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
import { Button } from '@neup/components/ui/button';
import { Separator } from '@neup/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@neup/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@neup/components/ui/skeleton';
import { Mail, MessageSquare, Phone, Send } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@neup/components/ui/accordion";

interface ContactInfo {
  email: string | null;
  phone: string | null;
  name?: string;
}

function extractContactInfo(inquiry: Inquiry): ContactInfo {
  let email: string | null = null;
  let phone: string | null = null;
  let name: string = 'Guest';

  if (inquiry.type === 'contact') {
    if (inquiry.data?.email) email = inquiry.data.email;
    if (inquiry.data?.phone) phone = inquiry.data.phone;
    if (inquiry.data?.name) name = inquiry.data.name;
  } else if (inquiry.type === 'customization') {
    const initialUserMessage = inquiry.conversation?.find(c => c.role === 'user')?.text || '';
    const contactInfoMatch = initialUserMessage.match(/Contact Info: (.+)/);

    if (contactInfoMatch) {
      const info = contactInfoMatch[1].trim();
      if (info.includes('@')) {
        const emailMatch = info.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) email = emailMatch[1];
      }

      const phoneClean = info.replace(/[^\d+]/g, '');
      if (phoneClean.length > 6 && !info.includes('@')) {
        phone = info;
      }
    }
  }

  return { email, phone, name };
}


function InquiryRow({ inquiry, onReply }: { inquiry: Inquiry, onReply: (contact: ContactInfo) => void }) {
  const isCustomization = inquiry.type === 'customization';
  const createdAt = inquiry.createdAt ? formatDistanceToNow(new Date(inquiry.createdAt as any), { addSuffix: true }) : 'N/A';
  const contactInfo = extractContactInfo(inquiry);

  const getPrimaryContactDisplay = () => {
    if (contactInfo.email) return contactInfo.email;
    if (contactInfo.phone) return contactInfo.phone;
    return contactInfo.name;
  };

  return (
    <AccordionItem value={inquiry.id} className="border-b last:border-b-0">
      <AccordionTrigger className="hover:no-underline px-0 py-0 [&[data-state=open]>div]:bg-accent/5">
        <div className="flex items-center gap-4 p-4 hover:bg-accent/5 transition-colors w-full text-left">
          {/* Icon Box */}
          <div className="h-20 w-20 bg-muted rounded flex items-center justify-center overflow-hidden border flex-shrink-0">
            {isCustomization ? (
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            ) : (
              <Mail className="h-8 w-8 text-muted-foreground/50" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-base text-foreground">{getPrimaryContactDisplay()}</p>
            <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-1">
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 lowercase font-normal">
                {isCustomization ? 'Custom Trip' : 'Contact Form'}
              </Badge>
              <span>&bull;</span>
              <span>{createdAt}</span>
              {contactInfo.name && contactInfo.name !== 'Guest' && (
                <>
                  <span>&bull;</span>
                  <span>{contactInfo.name}</span>
                </>
              )}
            </div>
            {inquiry.type === 'contact' && inquiry.data?.subject && (
              <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                {inquiry.data.subject}
              </p>
            )}
            {isCustomization && (
              <p className="text-sm text-muted-foreground mt-1 truncate max-w-md italic">
                Trip customization request...
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-0 pb-0">
        <div className="bg-muted/30 border-t p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              {isCustomization ? (
                <div className="space-y-4 bg-card border rounded-lg p-4">
                  {inquiry.conversation?.map((message, index) => (
                    <div key={index} className={`text-sm flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-lg p-3 max-w-[85%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase">{message.role}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">From</span>
                      <span>{inquiry.data?.name}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Email</span>
                      <span>{inquiry.data?.email}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold text-muted-foreground block text-xs uppercase mb-1">Subject</span>
                      <span>{inquiry.data?.subject}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="prose prose-sm max-w-none text-foreground">
                    <p className="whitespace-pre-wrap leading-relaxed">{inquiry.data?.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-64 flex-shrink-0 space-y-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium">Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  <Button size="sm" className="w-full justify-start" onClick={() => onReply(contactInfo)}>
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  {contactInfo.phone && (
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => {
                      const cleanPhone = contactInfo.phone?.replace(/[^\d]/g, '') || '';
                      window.open(`https://wa.me/${cleanPhone}`, '_blank');
                    }}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export default function InquiriesList() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null);

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

  const handleReplyClick = (contact: ContactInfo) => {
    if (contact.email && contact.phone) {
      setSelectedContact(contact);
      setReplyDialogOpen(true);
      return;
    }
    if (contact.email) {
      window.location.href = `mailto:${contact.email}?subject=Re: Your Inquiry to Happy Mountain Nepal`;
      return;
    }
    if (contact.phone) {
      openWhatsApp(contact.phone);
      return;
    }
    alert("No contact information found for this inquiry.");
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const message = encodeURIComponent("Hello! We received your inquiry at Happy Mountain Nepal.");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

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
    <>
      <div className="space-y-4">
        {inquiries.length > 0 ? (
          <Card className="overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {inquiries.map((inquiry) => (
                <InquiryRow key={inquiry.id} inquiry={inquiry} onReply={handleReplyClick} />
              ))}
            </Accordion>
          </Card>
        ) : (
          <div className="text-center py-16 text-muted-foreground border rounded-lg bg-card">
            <Mail className="mx-auto h-12 w-12 opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No Inquiries Yet</h3>
            <p>New inquiries will appear here as they are submitted.</p>
          </div>
        )}
      </div>

      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>
              This user provided both an email and a phone number. How would you like to reply?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (selectedContact?.email) {
                  window.location.href = `mailto:${selectedContact.email}?subject=Re: Your Inquiry to Happy Mountain Nepal`;
                  setReplyDialogOpen(false);
                }
              }}
            >
              <Mail className="h-8 w-8" />
              <span>Email</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => {
                if (selectedContact?.phone) {
                  openWhatsApp(selectedContact.phone);
                  setReplyDialogOpen(false);
                }
              }}
            >
              <MessageSquare className="h-8 w-8 text-green-600" />
              <span>WhatsApp</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
