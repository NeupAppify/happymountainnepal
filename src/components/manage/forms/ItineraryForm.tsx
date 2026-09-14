
'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@neup/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@neup/components/ui/form';
import { Input } from '@neup/components/ui/input';
import { Textarea } from '@neup/components/ui/textarea';
import { Card, CardContent } from '@neup/components/ui/card';
import { type Tour } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface ItineraryFormProps {
  tour?: Tour; // Make tour optional for reuse
}

export function ItineraryForm({ tour }: ItineraryFormProps) {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "itinerary",
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <FormField
                  control={control}
                  name={`itinerary.${index}.day`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-1">
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`itinerary.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Arrival in Kathmandu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`itinerary.${index}.description`}
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Details about the day's activities..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-6">
          <Button 
              type="button" 
              variant="outline" 
              onClick={() => append({ day: fields.length + 1, title: '', description: '' })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Day
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
