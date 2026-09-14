'use client';

import { useForm, FormProvider } from 'react-hook-form';
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
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { type TeamMember } from '@/lib/types';
import { addTeamMember, updateTeamMember, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaPicker } from '../MediaPicker'; // Updated import
import { usePathname } from 'next/navigation';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(3, { message: "Role must be at least 3 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  image: z.string().url({ message: "Please upload an image." }).min(1, "Image is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamMemberFormProps {
  member?: TeamMember;
}

export function TeamMemberForm({ member }: TeamMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: member || {
      name: '',
      role: '',
      bio: '',
      image: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        if (member) {
          await updateTeamMember(member.id, values);
          toast({ title: 'Success', description: 'Team member updated.' });
        } else {
          await addTeamMember(values);
          toast({ title: 'Success', description: 'Team member created.' });
        }
      } catch (error: any) {
        console.error("Failed to save team member:", error);
        const context = {
            memberId: member?.id,
            values: values,
        };
        logError({ message: `Failed to save team member: ${error.message}`, stack: error.stack, pathname, context });
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save team member. Please try again.',
        });
      }
    });
  };

  return (
    <FormProvider {...form}>
        <Card>
        <CardContent className="p-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                        <Input placeholder="Lead Guide" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="John is an experienced mountaineer..."
                        {...field}
                        disabled={isPending}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <MediaPicker name="image" label="Profile Image" category="user-photo" />
                <FormMessage>{form.formState.errors.image?.message}</FormMessage>

                <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {member ? 'Update Member' : 'Create Member'}
                </Button>
            </form>
            </Form>
        </CardContent>
        </Card>
    </FormProvider>
  );
}
