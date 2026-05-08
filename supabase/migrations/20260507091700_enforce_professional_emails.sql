-- Function to check if the email domain is in the forbidden list
CREATE OR REPLACE FUNCTION public.check_professional_email()
RETURNS TRIGGER AS $$
BEGIN
  -- List of forbidden generic domains (case-insensitive check)
  IF NEW.email ~* '(@gmail\.com|@yahoo\.com|@hotmail\.com|@outlook\.com|@icloud\.com|@protonmail\.com|@aol\.com|@live\.com|@msn\.com|@yandex\.com|@mail\.com|@gmx\.com|@me\.com)$' THEN
    RAISE EXCEPTION 'Only professional/institutional emails are allowed (e.g., @university.edu or @hospital.org).';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is attached to auth.users
-- We use a DO block to safely drop and recreate the trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'ensure_pro_email') THEN
    DROP TRIGGER ensure_pro_email ON auth.users;
  END IF;
END $$;

CREATE TRIGGER ensure_pro_email
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.check_professional_email();
