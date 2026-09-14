'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@neup/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@neup/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@neup/components/ui/card';
import { type Tour } from '@/lib/types';
import { updateTour, logError, validateTourForPublishing } from '@/lib/db';
import { useTransition, useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff, Book, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@neup/components/ui/radio-group';
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  status: z.enum(['draft', 'published', 'unpublished', 'hidden']),
});

type FormValues = z.infer<typeof formSchema>;

interface PublishFormProps {
  tour: Tour;
}

const statusConfig = {
    published: {
        icon: Eye,
        label: "Published",
        description: "Visible to everyone on the website and in search results."
    },
    hidden: {
        icon: EyeOff,
        label: "Hidden",
        description: "Not listed publicly, but accessible via a direct link."
    },
    unpublished: {
        icon: Book,
        label: "Unpublished",
        description: "Not accessible to anyone. Considered a work in progress."
    }
}

function ChecklistItem({ isChecked, text }: { isChecked: boolean; text: string }) {
    return (
        <li className="flex items-center gap-2">
            {isChecked ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
            <span className={isChecked ? 'text-foreground' : 'text-muted-foreground'}>{text}</span>
        </li>
    );
}

export function PublishForm({ tour }: PublishFormProps) {
  const [isPending, startTransition] = useTransition();
  const [validationResult, setValidationResult] = useState<string[] | true>([]);
  const [isChecking, setIsChecking] = useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: tour.status || 'draft',
    },
  });

  useEffect(() => {
    async function validate() {
        setIsChecking(true);
        const result = await validateTourForPublishing(tour.id);
        setValidationResult(result);
        setIsChecking(false);
    }
    validate();
  }, [tour.id]);

  const canPublish = validationResult === true;

  const onSubmit = (values: FormValues) => {
    if (values.status === 'published' && !canPublish) {
        toast({
            variant: 'destructive',
            title: 'Cannot Publish',
            description: 'Please fix all items in the checklist before publishing.',
        });
        return;
    }

    startTransition(async () => {
      try {
        await updateTour(tour.id, { status: values.status });
        toast({ title: 'Success', description: 'Publication status updated.' });
      } catch (error: any) {
        logError({ message: `Failed to update status for tour ${tour.id}`, stack: error.stack, pathname, context: { tourId: tour.id, values } });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save status. Please try again.',
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Publication Status</CardTitle>
          <CardDescription>Control the visibility of this tour package on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 gap-4"
                                disabled={isPending}
                                >
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <FormItem key={key} className="flex items-center space-x-3 space-y-0">
                                        <Card className="flex-1">
                                            <div className="flex items-center space-x-3 p-4">
                                                <FormControl>
                                                    <RadioGroupItem value={key} disabled={key === 'published' && !canPublish && !isChecking} />
                                                </FormControl>
                                                <div className="flex items-center gap-2">
                                                    <config.icon className="h-5 w-5" />
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="font-semibold">{config.label}</FormLabel>
                                                        <p className="text-sm text-muted-foreground">{config.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </FormItem>
                                ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Status
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Publish Checklist</CardTitle>
            <CardDescription>All items must be completed before you can publish this package.</CardDescription>
        </CardHeader>
        <CardContent>
            {isChecking ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking package completeness...</span>
                </div>
            ) : Array.isArray(validationResult) && validationResult.length > 0 ? (
                <ul className="space-y-2 text-sm">
                    {validationResult.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-destructive">
                           <XCircle className="h-4 w-4" /> 
                           <span>{item}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <Check className="h-5 w-5" />
                    <span>All checks passed. This package is ready to be published!</span>
                </div>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
