
import { supabase } from '@/integrations/supabase/client';
import { ImportantLink } from '../ImportantLinksTable';
import { LinkFormValues } from '../ImportantLinkForm';

export const fetchImportantLinks = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_important_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const addImportantLink = async (values: LinkFormValues, projectId: string, userId: string) => {
  const { error } = await supabase
    .from('project_important_links')
    .insert({
      project_id: projectId,
      title: values.title,
      url: values.url,
      description: values.description || null,
      user_id: userId,
    });

  if (error) {
    console.error('Insert error details:', error);
    throw error;
  }
};

export const updateImportantLink = async (values: LinkFormValues, linkId: string) => {
  const { error } = await supabase
    .from('project_important_links')
    .update({
      title: values.title,
      url: values.url,
      description: values.description || null,
    })
    .eq('id', linkId);

  if (error) throw error;
};

export const deleteImportantLink = async (linkId: string) => {
  const { error } = await supabase
    .from('project_important_links')
    .delete()
    .eq('id', linkId);

  if (error) throw error;
};
