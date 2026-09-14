
'use client';
import Image from 'next/image';
import type { TeamMember } from '@/lib/types';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@neup/components/ui/button';

interface TeamMemberClientProps {
  member: TeamMember;
}

export default function TeamMemberClient({ member }: TeamMemberClientProps) {
  return (
    <div className="container mx-auto py-16">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 flex justify-center">
              <div className="relative w-48 h-64 md:w-56 md:h-72">
                <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-lg object-cover ring-4 ring-primary/50"
                    data-ai-hint="portrait person"
                />
              </div>
            </div>
            <div className="md:col-span-2 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold !font-headline">{member.name}</h1>
                <p className="text-xl font-semibold text-primary mt-1">{member.role}</p>
                <p className="mt-4 text-lg text-muted-foreground">{member.bio}</p>
                {member.socials && (
                    <div className="flex justify-center md:justify-start gap-4 mt-6">
                        {member.socials.twitter && (
                            <Button asChild variant="ghost" size="icon">
                                <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter className="h-5 w-5" /></a>
                            </Button>
                        )}
                        {member.socials.linkedin && (
                           <Button asChild variant="ghost" size="icon">
                             <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.25 6.5 1.75 1.75 0 0 1 6.5 8.25ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93-.78 0-1.22.51-1.42 1a2.5 2.5 0 0 0-.12.89V19h-3V10h3v1.32a2.78 2.78 0 0 1 2.5-1.43c1.88 0 3.39 1.25 3.39 3.96Z"/></svg>
                             </a>
                           </Button>
                        )}
                        {member.socials.facebook && (
                            <Button asChild variant="ghost" size="icon">
                                <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer"><Facebook className="h-5 w-5" /></a>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {member.story && (
          <div className="prose prose-lg max-w-none mx-auto formatted-content">
            <h2 className="text-3xl font-bold !font-headline border-b pb-4 mb-6">My Story</h2>
            <div dangerouslySetInnerHTML={{ __html: member.story }} />
          </div>
        )}

        {member.gallery && member.gallery.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold !font-headline mb-6 text-center">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {member.gallery.map((imgUrl, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                  <Image src={imgUrl} alt={`${member.name}'s gallery image ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
