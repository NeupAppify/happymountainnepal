
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Bot, Mail } from 'lucide-react';
import { Button } from '@neup/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@neup/components/ui/card';
import { useSiteProfile } from '@/hooks/use-site-profile';
import { cn } from '@/lib/utils';
import { CustomizeTrip } from './CustomizeTrip';
import { getGeneralChatMessage } from '@/lib/chat-messages';

const WhatsAppIcon = () => (
    <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
        <path d=" M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.043-.765.315-.23.272-.904.867-.904 2.09 0 1.223.945 2.64 1.088 2.804.143.164 1.569 3.254 3.787 4.47 2.06.996 2.64 1.13 2.96.945.315-.187.99-.945 1.13-1.39.143-.446.143-.867.073-1.13-.073-.272-.24-.372-.51-.65Z"></path>
        <path d="M20.57 14.317c-1.61-3.617-4.38-6.387-8.28-8.28C9.39 4.62 6.8 5.46 5.46 6.8c-1.34 1.34-2.18 3.93-1.76 6.87 1.45 10.02 9.38 17.96 19.4 19.4 2.94.42 5.53-.42 6.87-1.76 1.34-1.34.8-3.93-1.12-6.87-1.8-2.8-4.5-5.4-7.27-7.27Z"></path>
    </svg>
);

interface ChatbotProps {
  prefilledWhatsapp?: string;
  prefilledEmail?: {
    subject: string;
    body: string;
  };
  tempUserId: string; // Now passed as a prop
}

export function Chatbot({ prefilledWhatsapp, prefilledEmail, tempUserId }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const { profile, isLoading } = useSiteProfile();

    const finalMessages = useMemo(() => {
        const userId = tempUserId || 'NotAvailable';
        const generalMessages = getGeneralChatMessage();
        return {
            whatsapp: (prefilledWhatsapp || generalMessages.whatsapp).replace('[userTempId]', userId),
            email: {
                subject: (prefilledEmail?.subject || generalMessages.email.subject).replace('[userTempId]', userId),
                body: (prefilledEmail?.body || generalMessages.email.body).replace('[userTempId]', userId),
            }
        };
    }, [tempUserId, prefilledWhatsapp, prefilledEmail]);


    if (isLoading || !profile?.chatbot?.enabled) {
        return null;
    }

    const { position, whatsappNumber, emailAddress } = profile.chatbot;

    const positionClasses: Record<string, string> = {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'middle-right': 'top-1/2 right-4 -translate-y-1/2',
        'middle-left': 'top-1/2 left-4 -translate-y-1/2',
    };

    const pos = position || 'bottom-right';
    const isTop = pos.includes('top');
    const isLeft = pos.includes('left');

    const menuClasses = cn(
        "absolute w-72 z-40",
        isTop ? "top-[4.5rem]" : "bottom-[4.5rem]",
        isLeft ? "left-0" : "right-0",
        isTop ? (isLeft ? "origin-top-left" : "origin-top-right") : (isLeft ? "origin-bottom-left" : "origin-bottom-right")
    );

    const menuAnimation = {
        open: { opacity: 1, scale: 1, y: 0 },
        closed: { opacity: 0, scale: 0.95, y: isTop ? -20 : 20 },
    };

    const whatsappLink = `https://wa.me/${whatsappNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(finalMessages.whatsapp)}`;
    const emailLink = `mailto:${emailAddress}?subject=${encodeURIComponent(finalMessages.email.subject)}&body=${encodeURIComponent(finalMessages.email.body)}`;

    if (isChatting) {
        return (
            <div className={cn("fixed z-50", positionClasses[pos])}>
                <Card className="w-[350px] h-[500px] flex flex-col">
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle>Customize Your Trip</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsChatting(false)}><X className="h-4 w-4" /></Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                        <CustomizeTrip />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div id="chatbot-container" className={cn("fixed z-50 flex flex-col items-end", positionClasses[pos])}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuAnimation}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className={menuClasses}
                    >
                        <Card className="shadow-2xl">
                            <CardHeader>
                                <CardTitle>How can we help?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button className="w-full justify-start" onClick={() => { setIsChatting(true); setIsOpen(false); }}>
                                    <Bot className="mr-2 h-5 w-5" /> Message Now
                                </Button>
                                {whatsappNumber && (
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                            <WhatsAppIcon /> <span className='ml-2'>WhatsApp</span>
                                        </a>
                                    </Button>
                                )}
                                {emailAddress && (
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a href={emailLink}>
                                            <Mail className="mr-2 h-5 w-5" /> Email Us
                                        </a>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className="rounded-full w-16 h-16 shadow-lg relative"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <AnimatePresence initial={false} mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                            animate={{ rotate: 0, scale: 1, opacity: 1 }}
                            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <X className="h-8 w-8" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                            animate={{ rotate: 0, scale: 1, opacity: 1 }}
                            exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <MessageSquare className="h-8 w-8" />
                        </motion.div>
                    )}
                </AnimatePresence>
                <span className="sr-only">Toggle Chat</span>
            </Button>
        </div>
    );
}

// A minimal version of CustomizeTrip for the popup
function CustomizeTripPopup() {
    return (
        <div>
            {/* The full logic from /customize page would go here */}
            <p>Chat interface placeholder.</p>
        </div>
    );
}
