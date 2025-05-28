const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const command = process.argv[2]
  
  switch (command) {
    case 'list':
      await listAdmins()
      break
    case 'create':
      await createAdmin()
      break
    case 'reset-password':
      await resetPassword()
      break
    default:
      console.log('📋 SatsClub Admin Management')
      console.log('')
      console.log('Usage:')
      console.log('  npm run admin:list              - List all admins')
      console.log('  npm run admin:create             - Create new admin (interactive)')
      console.log('  npm run admin:reset-password     - Reset admin password (interactive)')
      console.log('')
      console.log('Examples:')
      console.log('  EMAIL=john@example.com PASSWORD=newpass123 NAME="John Doe" npm run admin:create')
      console.log('  EMAIL=admin@satsclub.local PASSWORD=newpass npm run admin:reset-password')
  }
}

async function listAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    })
    
    console.log('👑 SatsClub Administrators:')
    console.log('')
    
    if (admins.length === 0) {
      console.log('No administrators found. Run "npm run seed:admin" to create the first admin.')
      return
    }
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name}`)
      console.log(`   📧 ${admin.email}`)
      console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ Error listing admins:', error.message)
  }
}

async function createAdmin() {
  try {
    const email = process.env.EMAIL
    const password = process.env.PASSWORD
    const name = process.env.NAME
    
    if (!email || !password || !name) {
      console.log('❌ Missing required environment variables.')
      console.log('Usage: EMAIL=admin@example.com PASSWORD=pass123 NAME="Admin Name" npm run admin:create')
      return
    }
    
    // Check if admin already exists
    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      console.log(`❌ Admin with email ${email} already exists.`)
      return
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })
    
    console.log('✅ Admin created successfully!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Name: ${admin.name}`)
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
  }
}

async function resetPassword() {
  try {
    const email = process.env.EMAIL
    const password = process.env.PASSWORD
    
    if (!email || !password) {
      console.log('❌ Missing required environment variables.')
      console.log('Usage: EMAIL=admin@example.com PASSWORD=newpass123 npm run admin:reset-password')
      return
    }
    
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      console.log(`❌ Admin with email ${email} not found.`)
      return
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Password updated successfully!')
    console.log(`📧 Email: ${email}`)
    console.log(`🔑 New password: ${password}`)
    
  } catch (error) {
    console.error('❌ Error resetting password:', error.message)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 