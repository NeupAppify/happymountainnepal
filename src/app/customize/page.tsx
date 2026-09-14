
'use client';

import { useState } from 'react';
import { Button } from '@neup/components/ui/button';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@neup/components/ui/form';
import {
  customizeTrip,
  CustomizeTripInput,
} from '@/ai/flows/customize-trip-flow';
import { Loader2, ArrowRight, Wand2, Check, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveInquiry, logError } from '@/lib/db';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  conversation: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      text: z.string(),
    })
  ),
  currentUserInput: z.string().min(1, 'Please provide an answer.'),
  contactInfo: z.string().min(1, 'Please provide your email or phone number.'),
  initialInterest: z.string().min(10, 'Please tell us a bit more about your desired trip.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CustomizePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isInitialStep, setIsInitialStep] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conversation: [],
      currentUserInput: '',
      contactInfo: '',
      initialInterest: '',
    },
  });

  const conversation = form.watch('conversation');
  const currentQuestion = isInitialStep ? {
      role: 'model',
      text: 'What kind of travel or trek are you looking for?',
    } : conversation.length > 0 ? conversation[conversation.length - 1] : null;

  const questionNumber = conversation.filter(q => q.role === 'model').length;

  const handleBack = () => {
    if (conversation.length <= 1) {
        setIsInitialStep(true);
        form.setValue('conversation', []);
        return;
    }
    const lastUserInput = conversation[conversation.length - 2].text;
    const newConversation = conversation.slice(0, -2);
    form.setValue('conversation', newConversation);
    form.setValue('currentUserInput', lastUserInput);
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    if (isInitialStep) {
        const initialUserMessage = `Initial interest: ${values.initialInterest}. Contact Info: ${values.contactInfo}`;
        const newConversation: CustomizeTripInput = [{ role: 'user', text: initialUserMessage }];
        
        try {
            const result = await customizeTrip(newConversation);
            form.setValue('conversation', [
                ...newConversation, 
                { role: 'model', text: result.nextQuestion }
            ]);
            if (result.isFinished) {
                setIsFinished(true);
            }
            setIsInitialStep(false);
        } catch (error: any) {
           console.error('AI Error:', error);
           logError({ message: error.message, stack: error.stack, pathname, context: { flow: 'customizeTrip', step: 'initial', input: newConversation } });
           toast({
             variant: 'destructive',
             title: 'Error',
             description: 'There was a problem starting the customization. Please try again.',
           });
        }
    } else if (isFinished) {
        await handleFinalSubmit(values);
    } else {
        const userInput = values.currentUserInput.trim();
        if (!userInput) {
            form.setError('currentUserInput', { message: 'Please provide an answer.' });
            setIsLoading(false);
            return;
        }

        const newConversation: CustomizeTripInput = [
          ...values.conversation,
          { role: 'user', text: userInput },
        ];
        
        form.setValue('conversation', newConversation);
        form.resetField('currentUserInput');

        try {
          const result = await customizeTrip(newConversation);

          form.setValue('conversation', [
            ...newConversation, 
            { role: 'model', text: result.nextQuestion }
          ]);
          
          if (result.isFinished) {
            setIsFinished(true);
          }
        } catch (error: any) {
          console.error('AI Error:', error);
          logError({ message: error.message, stack: error.stack, pathname, context: { flow: 'customizeTrip', step: 'follow-up', input: newConversation } });
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'There was a problem communicating with the AI. Please try again.',
          });
          form.setValue('conversation', values.conversation);
        }
    }
    setIsLoading(false);
  };
  
  const handleFinalSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
        await saveInquiry({
            type: 'customization',
            conversation: values.conversation,
            page: pathname
        });
        toast({
            title: "Inquiry Sent!",
            description: "Thank you for your message. We'll get back to you with a custom plan shortly.",
        });
        
        // Reset the entire experience
        form.reset();
        setIsFinished(false);
        setIsInitialStep(true);
    } catch(error: any) {
        console.error('Database Error:', error);
        logError({ message: `Failed to save inquiry: ${error.message}`, stack: error.stack, pathname, context: { function: 'saveInquiry', input: values.conversation } });
        toast({
            variant: 'destructive',
            title: "Database Error",
            description: "Could not save your inquiry. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-16">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-8">
          <Wand2 className="h-12 w-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold !font-headline mt-4">
            Create Your Dream Trip
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Let our AI craft the perfect itinerary just for you. Answer a few questions to get started.
          </p>
        </div>

        <FormProvider {...form}>
         <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-6"
        >
            {isInitialStep ? (
                <div className="space-y-6">
                    <div>
                        <span className="text-primary font-semibold flex items-center gap-2">
                           Start Here <ArrowRight className="h-4 w-4" />
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold !font-headline mt-1">
                            What kind of travel or trek are you looking for?
                        </h2>
                         <p className="text-muted-foreground mt-2">Tell us your ideas. Are you looking for a challenging trek, a cultural tour, a family vacation, or something else?</p>
                    </div>
                    <FormField
                        control={form.control}
                        name="initialInterest"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="e.g., 'I want a 10-day moderate trek in the Annapurna region with great mountain views and some cultural experiences.'"
                                    autoComplete="off"
                                    disabled={isLoading}
                                    className="text-lg bg-card"
                                    rows={5}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactInfo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contact Info (Email and/or Phone)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="your@email.com and/or +1 555-123-4567" {...field} className="pl-10 bg-card text-lg h-12" />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Start Customization'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            ) : isFinished ? (
                 <div className="space-y-6 text-center">
                    <Check className="mx-auto h-12 w-12 text-green-500 bg-green-100 rounded-full p-2" />
                     <h2 className="text-2xl font-bold !font-headline">All Set!</h2>
                    <p className="text-muted-foreground">{currentQuestion?.text}</p>
                    <p className="text-sm text-muted-foreground">Our team will review your responses and get back to you with a personalized plan.</p>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Finish & Submit'}
                    </Button>
                 </div>
            ) : (
                <div className="space-y-6">
                    {currentQuestion && (
                        <div>
                            <span className="text-primary font-semibold flex items-center gap-2">
                               Question {questionNumber} <ArrowRight className="h-4 w-4" />
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold !font-headline mt-1">
                                {currentQuestion.text}
                            </h2>
                        </div>
                    )}
                    <FormField
                    control={form.control}
                    name="currentUserInput"
                    render={({ field }) => (
                        <FormItem>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Type your answer here..."
                                autoComplete="off"
                                disabled={isLoading}
                                className="text-lg h-12 bg-card"
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className='flex items-center gap-4'>
                        <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Next'}
                            {!isLoading && <Check className="ml-2 h-4 w-4" />}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleBack}
                            disabled={isLoading}
                        >
                             <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </div>
                </div>
            )}
            </form>
        </FormProvider>
      </div>
    </div>
  );
}

    
