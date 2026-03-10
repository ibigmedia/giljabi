import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const policies = await prisma.$queryRaw`SELECT polname, polcmd, polqual, polwithcheck FROM pg_policy WHERE polrelid = '"GroupMember"'::regclass;`
  console.log(policies)
}
main()
