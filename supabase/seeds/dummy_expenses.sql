-- Dummy Expenses Script 
-- This script ensures default categories exist and inserts some dummy expenses
-- It links them to the first existing user in the database.

DO $$ 
DECLARE
    v_user_id UUID;
    cat_maintenance UUID;
    cat_salary UUID;
    cat_utilities UUID;
    cat_food UUID;
    cat_cleaning UUID;
BEGIN
    -- 1. Grab the first available user ID to act as the creator
    SELECT id INTO v_user_id FROM public.profiles LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found in the profiles table. Please register/login to the app first.';
    END IF;

    -- 2. Ensure Categories Exist
    INSERT INTO public.expense_categories (name, color, description, is_default) 
    VALUES
        ('Maintenance', '#DC2626', 'Building and equipment repairs', TRUE),
        ('Staff Salary', '#7C3AED', 'Employee salaries and wages', TRUE),
        ('Utilities', '#0EA5E9', 'Electricity, water, and other utilities', TRUE),
        ('Food Supplies', '#F97316', 'Kitchen and F&B supplies', TRUE),
        ('Cleaning Supplies', '#10B981', 'Housekeeping and cleaning materials', TRUE)
    ON CONFLICT (name) DO NOTHING;

    -- 3. Retrieve specific category IDs
    SELECT id INTO cat_maintenance FROM public.expense_categories WHERE name = 'Maintenance' LIMIT 1;
    SELECT id INTO cat_salary FROM public.expense_categories WHERE name = 'Staff Salary' LIMIT 1;
    SELECT id INTO cat_utilities FROM public.expense_categories WHERE name = 'Utilities' LIMIT 1;
    SELECT id INTO cat_food FROM public.expense_categories WHERE name = 'Food Supplies' LIMIT 1;
    SELECT id INTO cat_cleaning FROM public.expense_categories WHERE name = 'Cleaning Supplies' LIMIT 1;

    -- 4. Insert Dummy Expenses
    INSERT INTO public.expenses (title, category_id, amount, date, payment_mode, notes, created_by)
    VALUES
        ('Plumbing Repair', cat_maintenance, 2500.00, CURRENT_DATE - INTERVAL '2 days', 'Cash', 'Fixed leaking pipe in Room 104', v_user_id),
        ('April Salary Advance', cat_salary, 15000.00, CURRENT_DATE - INTERVAL '1 days', 'Bank', 'Advance for John', v_user_id),
        ('Electricity Bill', cat_utilities, 8500.00, CURRENT_DATE, 'UPI', 'Bill for March', v_user_id),
        ('Vegetables & Meat', cat_food, 4200.00, CURRENT_DATE - INTERVAL '3 days', 'UPI', 'Weekly stock', v_user_id),
        ('Detergents and Mops', cat_cleaning, 1200.00, CURRENT_DATE, 'Card', '', v_user_id);

END $$;
