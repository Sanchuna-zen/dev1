'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Shop name must be at least 2 characters.",
  }),
  address: z.string().min(10, {
    message: "Please enter a full address.",
  }),
  description: z.string().max(200, {
    message: "Description must not be longer than 200 characters.",
  }).optional(),
  contact_info: z.string().min(5, {
    message: "Please enter valid contact information (phone or email).",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ShopProfileFormProps {
    onSubmit: (data: ProfileFormValues) => void;
    defaultValues?: Partial<ProfileFormValues>;
    isLoading?: boolean;
}

export function ShopProfileForm({ onSubmit, defaultValues, isLoading }: ShopProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaultValues,
    mode: "onChange",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Shop" {...field} />
              </FormControl>
              <FormDescription>
                This is your shop's public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, Anytown, USA"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The physical address of your shop.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about your shop"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of what your shop sells.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_info"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Info</FormLabel>
              <FormControl>
                <Input placeholder="phone@example.com or 555-123-4567" {...field} />
              </FormControl>
              <FormDescription>
                How customers can contact you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save and Continue"}
        </Button>
      </form>
    </Form>
  )
}
