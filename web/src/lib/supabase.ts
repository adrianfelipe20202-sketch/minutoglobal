import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DBArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  source: string;
  source_url: string;
  published_at: string;
  created_at: string;
  read_time: string;
  is_published: boolean;
}
