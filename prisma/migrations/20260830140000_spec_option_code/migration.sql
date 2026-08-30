-- Per-option catalogue code. The letterhead card identifies each paper by a
-- code (601 A4-80 GSM … 605 A4 80 white + 60 yellow), and customers order by it.
ALTER TABLE "SpecOption" ADD COLUMN "code" TEXT;
