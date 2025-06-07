import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Check if user exists in User table
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (user) {
          // For regular users, we'll handle password later when we implement it
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        // Check if admin exists
        const admin = await prisma.admin.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (admin && await bcrypt.compare(credentials.password, admin.password)) {
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'ADMIN' as const
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
} 