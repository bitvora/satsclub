# SatsClub 🟠

A self-hosted Patreon alternative powered by Bitcoin subscriptions. Create premium content and get paid in Bitcoin.

## Features

- 🟠 **Bitcoin Payments**: Accept subscriptions with Bitcoin using third-party payment providers
- 🏠 **Self-Hosted**: Complete control over your content and subscriber data  
- 🎨 **Content Management**: Support for videos, images, and blog posts (Markdown)
- 👥 **User Management**: Separate admin and subscriber roles
- 📊 **Analytics Dashboard**: Track subscriber count, MRR, and other key metrics
- 🔐 **Access Control**: Paywall content for subscribers only
- 🎨 **Beautiful UI**: Modern, responsive design with dark mode support

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials
- **Payments**: Webhook-based integration (BTCPay Server, etc.)
- **File Storage**: Local file uploads with access control

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd satsclub
npm install
```

### 2. Setup Environment Variables

Copy the environment variables and update them:

```bash
cp .env.example .env.local
```

Update `.env.local` with your settings:

```bash
# Database
DATABASE_URL="postgresql://satsclub_user:satsclub_password@localhost:5477/satsclub"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# File uploads
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=50000000

# Payment webhook secret
WEBHOOK_SECRET="your-webhook-secret-here"

# Default admin credentials
DEFAULT_ADMIN_EMAIL="admin@satsclub.local"
DEFAULT_ADMIN_PASSWORD="admin123"
```

### 3. Start the Database

```bash
docker-compose up -d
```

### 4. Setup the Database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Optional: Open Prisma Studio to view/edit data
npm run db:studio
```

### 5. Create Your First Admin Account

```bash
# Create the default admin account
npm run seed:admin
```

This will create an admin with:
- 📧 **Email**: `admin@satsclub.local`
- 🔑 **Password**: `admin123`
- 👤 **Name**: SatsClub Admin

### 6. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your SatsClub instance!

## Admin Management

### 🎯 Admin Login & Dashboard

1. **Access Admin Login**: Visit `http://localhost:3000/auth/signin`
2. **Sign In**: Use your admin credentials (`admin@satsclub.local` / `admin123`)
3. **Admin Dashboard**: You'll be automatically redirected to `http://localhost:3000/admin`

The admin dashboard includes:
- 📊 **Analytics Overview**: Subscriber count, content count, monthly revenue
- 🎯 **Quick Actions**: Create posts, upload videos/images, manage settings
- 👑 **Admin Interface**: Full control over your SatsClub instance

### 📋 Admin Management Commands

#### List All Administrators
```bash
npm run admin:list
```
Shows all admin accounts with email, name, and creation date.

#### Create New Admin
```bash
# Interactive method - set environment variables
EMAIL=john@example.com PASSWORD=securepass123 NAME="John Doe" npm run admin:create
```

#### Reset Admin Password
```bash
# Reset password for existing admin
EMAIL=admin@satsclub.local PASSWORD=newpassword123 npm run admin:reset-password
```

#### Create Additional Admins
```bash
# If you need to create another default admin
npm run seed:admin
```

### 🔧 Admin Account Examples

```bash
# Create a new content manager
EMAIL=manager@satsclub.local PASSWORD=manager123 NAME="Content Manager" npm run admin:create

# Create a technical admin
EMAIL=tech@satsclub.local PASSWORD=tech123 NAME="Technical Admin" npm run admin:create

# Reset forgotten password
EMAIL=admin@satsclub.local PASSWORD=mynewpassword npm run admin:reset-password

# List all current admins
npm run admin:list
```

### 🛡️ Admin Security Best Practices

1. **Change Default Credentials**: Immediately change the default `admin123` password
2. **Use Strong Passwords**: Minimum 12 characters with mixed case, numbers, symbols
3. **Unique Email Addresses**: Each admin should have a unique email
4. **Regular Password Updates**: Reset passwords periodically
5. **Limit Admin Accounts**: Only create admin accounts for trusted users

## Database Schema

### Core Tables

- **User**: NextAuth.js user management with subscription status
- **Admin**: Content creators and site administrators
- **Content**: Videos, images, and blog posts with access control
- **Settings**: Site configuration (name, description, pricing, etc.)
- **PaymentEvent**: Webhook events from payment providers

## Payment Integration

SatsClub is designed to work with Bitcoin payment providers like:

- [BTCPay Server](https://btcpayserver.org/)
- [OpenNode](https://www.opennode.com/)
- [LNbits](https://lnbits.com/)

Configure webhooks in your payment provider to send events to:
```
POST /api/webhooks/payment
```

## Admin Features

### Content Management
- Create/edit/delete blog posts, videos, and images
- Markdown support for blog posts
- File upload for media content
- Publish/unpublish content

### Analytics Dashboard
- Subscriber count
- Monthly Recurring Revenue (MRR)
- Payment history
- Content performance

### Settings Management
- Site name and description
- Profile and banner images
- Subscription pricing
- Payment provider configuration

## User Flow

### For Subscribers
1. **Visit Home Page** → See beautiful landing page with pricing
2. **Sign Up** → Create account with email/password
3. **Subscribe** → Pay with Bitcoin via payment provider
4. **Access Content** → View premium content in dashboard

### For Admins
1. **Admin Login** → Sign in with admin credentials
2. **Dashboard Overview** → View analytics and quick actions
3. **Create Content** → Add videos, images, or blog posts
4. **Manage Settings** → Configure site metadata and pricing
5. **Monitor Subscribers** → Track growth and revenue

## Development

### Database Scripts
```bash
# Generate Prisma client
npm run db:generate

# Create a new migration
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Reset database (development only)
npx prisma migrate reset

# Open database browser
npm run db:studio
```

### Admin Scripts
```bash
# List all administrators
npm run admin:list

# Create new admin (with environment variables)
EMAIL=admin@example.com PASSWORD=pass123 NAME="Admin Name" npm run admin:create

# Reset admin password
EMAIL=admin@example.com PASSWORD=newpass123 npm run admin:reset-password

# Create default admin
npm run seed:admin
```

## Deployment

### Production Environment Variables

Make sure to update these for production:

```bash
NEXTAUTH_SECRET="a-very-secure-secret-key"
DATABASE_URL="your-production-database-url"
WEBHOOK_SECRET="your-webhook-secret-from-payment-provider"

# Admin credentials for production
DEFAULT_ADMIN_EMAIL="your-admin@yourdomain.com"
DEFAULT_ADMIN_PASSWORD="very-secure-password"
```

### Docker Deployment

The included `docker-compose.yml` can be used for production with modifications:

1. Update PostgreSQL credentials
2. Add environment file mounting
3. Configure reverse proxy (nginx, Caddy, etc.)
4. Setup SSL certificates

### File Storage

By default, uploaded files are stored locally in the `uploads` directory. For production, consider:

- Setting up proper file permissions
- Using a CDN for media delivery
- Implementing backup strategies

## Troubleshooting

### Admin Login Issues

```bash
# Check if admin exists
npm run admin:list

# Reset admin password
EMAIL=admin@satsclub.local PASSWORD=newpassword npm run admin:reset-password

# Recreate admin account
npm run seed:admin
```

### Database Connection Issues

```bash
# Check if database is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Check database connectivity
npm run db:studio
```

### NextAuth Session Errors

```bash
# Clear browser cookies and localStorage
# Restart development server
pkill -f "next dev"
npm run dev
```

### Development Server Issues

```bash
# Kill any running processes
pkill -f "next dev"

# Clear Next.js cache
rm -rf .next

# Restart development
npm run dev
```

## Security Considerations

- Change default admin credentials immediately
- Use strong secrets for production
- Implement rate limiting for API endpoints
- Regular database backups
- Monitor webhook endpoints for abuse
- Validate file uploads properly
- Use HTTPS in production
- Secure admin email addresses

## Adding New Features

1. Update Prisma schema in `prisma/schema.prisma`
2. Run `npm run db:generate` to update Prisma client
3. Create migration with `npm run db:migrate`
4. Update API routes and UI components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this for your own projects!

## Support

- Documentation: Check this README and inline code comments
- Issues: Create issues on GitHub for bugs or feature requests
- Community: Join the discussion in GitHub Discussions

---

**Made with ❤️ and ⚡ for the Bitcoin community**
