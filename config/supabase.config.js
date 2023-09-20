import { createClient } from "@supabase/supabase-js";
import { default as dotenv } from "dotenv";
dotenv.config();

console.log(process.env.SUPABASE_URL);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default supabase;
