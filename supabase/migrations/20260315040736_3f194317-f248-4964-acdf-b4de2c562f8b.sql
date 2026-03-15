
-- Allow parent role users to view achievements and documents of their linked students
CREATE POLICY "Parents can view student achievements" ON public.achievements
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.user_roles ur ON ur.user_id = auth.uid() AND ur.role = 'parent'
    WHERE s.id = achievements.student_id
  )
);

CREATE POLICY "Parents can view student documents" ON public.documents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.user_roles ur ON ur.user_id = auth.uid() AND ur.role = 'parent'
    WHERE s.id = documents.student_id
  )
);

-- Allow parents to download from storage
CREATE POLICY "Parents can view student documents storage" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND public.has_role(auth.uid(), 'parent')
);

-- Allow inserting user_roles during signup (needed for registration flow)
CREATE POLICY "Users can insert own role" ON public.user_roles
FOR INSERT WITH CHECK (auth.uid() = user_id);
