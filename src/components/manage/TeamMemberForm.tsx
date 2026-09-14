
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
import { Card, CardContent, CardHeader, CardTitle } from '@neup/components/ui/card';
import { type TeamMember, type TeamGroup } from '@/lib/types';
import { addTeamMember, updateTeamMember, logError } from '@/lib/db';
import { useTransition } from 'react';
import { Loader2, Facebook, Instagram, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MediaPicker } from './MediaPicker';
import { usePathname, useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@neup/components/ui/select';
import { RichTextEditor } from '../ui/RichTextEditor';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(3, { message: "Role must be at least 3 characters." }),
  bio: z.string().min(10, { message: "Bio must be at least 10 characters." }),
  shortDescription: z.string().optional(),
  story: z.string().optional(),
  image: z.string().url({ message: "Please upload an image." }).min(1, "Image is required."),
  gallery: z.array(z.string().url()).optional(),
  groupId: z.string().nullable().optional(),
  socials: z.object({
    twitter: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
    facebook: z.string().url().or(z.literal('')).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TeamMemberFormProps {
  member?: TeamMember;
  groups?: TeamGroup[];
}

export function TeamMemberForm({ member, groups = [] }: TeamMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: member ? {
      ...member,
      groupId: member.groupId || null,
      socials: member.socials || { twitter: '', linkedin: '', facebook: '' }
    } : {
      name: '',
      role: '',
      bio: '',
      image: '',
      shortDescription: '',
      story: '',
      gallery: [],
      groupId: null,
      socials: {
        twitter: '',
        linkedin: '',
        facebook: '',
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      try {
        const formattedValues = {
          ...values,
          groupId: values.groupId || undefined,
        };
        if (member) {
          await updateTeamMember(member.id, formattedValues as any);
          toast({ title: 'Success', description: 'Team member updated.' });
        } else {
          await addTeamMember(formattedValues as any);
          toast({ title: 'Success', description: 'Team member created.' });
        }
        router.push('/manage/team');
        router.refresh();
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
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value === 'null' ? null : value)}
                      defaultValue={field.value || 'null'}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None (Ungrouped)</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (Short)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A short introduction visible on the main team page."
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story (Optional)</FormLabel>
                    <FormControl>
                      <RichTextEditor value={field.value || ''} onChange={field.onChange} placeholder="Share a more detailed story about the team member..." />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">A detailed story for the member's profile page. Supports rich text.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MediaPicker name="image" label="Profile Image" category="user-photo" />
              <FormMessage>{form.formState.errors.image?.message}</FormMessage>

              {/* Gallery Picker */}
              <FormField
                control={form.control}
                name="gallery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gallery Images (Optional)</FormLabel>
                    <MediaPicker name="gallery" label="" category="user-photo" />
                    <FormMessage />
                  </FormItem>
                )}
              />


              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="socials.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Twitter className="h-4 w-4 mr-2" /> Twitter / X</FormLabel>
                        <FormControl>
                          <Input placeholder="https://x.com/username" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socials.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.75 1.75 0 0 1 6.5 8.25ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93-.78 0-1.22.51-1.42 1a2.5 2.5 0 0 0-.12.89V19h-3V10h3v1.32a2.78 2.78 0 0 1 2.5-1.43c1.88 0 3.39 1.25 3.39 3.96Z" /></svg> LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/username" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="socials.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Facebook className="h-4 w-4 mr-2" /> Facebook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://facebook.com/username" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

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
