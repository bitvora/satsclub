const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst()
    
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email)
      return
    }

    // Get admin details from environment or use defaults
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@satsclub.local'
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'
    const name = 'SatsClub Admin'

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    console.log('✅ Admin created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', admin.name)
    console.log('')
    console.log('🚀 You can now sign in at: http://localhost:3000/auth/signin')
    console.log('   After signing in, you\'ll be redirected to the admin dashboard.')

  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdmin() 