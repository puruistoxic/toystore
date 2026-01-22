# Khandelwal Toy Store - Wholesale Toy Supplier Platform

A modern React-based e-commerce platform for wholesale toy distribution. Built with TypeScript, Tailwind CSS, and deployed using Docker. Designed to help retailers, distributors, and e-commerce platforms source high-quality toys at wholesale prices.

## 🚀 Features

### Product Categories
- **Action Figures** - Superheroes, characters, and collectible figures
- **Art & Crafts** - Creative toys, coloring sets, and craft supplies
- **Educational & Learning Toys** - STEM toys, puzzles, and learning games
- **Remote Control Toys** - Cars, drones, helicopters, and more
- **Board Games** - Family games, strategy games, and card games
- **Dolls & Doll Houses** - Fashion dolls, baby dolls, and playsets
- **Baby Toys** - Rattles, teethers, and early development toys
- **Musical Toys** - Instruments, keyboards, and sound toys

### Key Features
- **Age-Based Filtering** - Filter toys by age groups (0-2, 3-5, 6-8, 9-12, 13+)
- **Occasion-Based Segments** - Birthday, holidays, festivals, educational
- **Gender Categories** - Boys, Girls, Unisex toys
- **Bulk Ordering** - Minimum order quantities and bulk discounts
- **WhatsApp Integration** - Direct lead generation through WhatsApp

### Technical Features
- ⚡ **Modern React 19** with TypeScript
- 🎨 **Tailwind CSS** for responsive design
- 🛒 **E-commerce functionality** for products and services
- 📱 **Mobile-first responsive design**
- 🔍 **Advanced search and filtering**
- 🛡️ **Security best practices**
- 🐳 **Docker containerization**
- 🚀 **Production-ready deployment**

## 🏗️ Project Structure

```
maketoys-web/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.tsx      # Navigation header
│   │   └── Footer.tsx      # Site footer
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Services.tsx    # Services listing
│   │   ├── Products.tsx    # Products catalog
│   │   ├── About.tsx       # About page
│   │   ├── Contact.tsx     # Contact form
│   │   ├── ProductDetail.tsx
│   │   ├── ServiceDetail.tsx
│   │   ├── Cart.tsx
│   │   └── Checkout.tsx
│   ├── types/              # TypeScript type definitions
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── nginx.conf             # Nginx configuration
├── deploy.sh              # Deployment script
├── server-setup.sh        # Server setup script
└── docs/                  # Documentation files
    ├── DEPLOYMENT.md      # Deployment documentation
    └── ...                # Other documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wainsoweb.git
   cd wainsoweb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

#### Option 1: Using Docker Compose (Recommended)

1. **Build and start the application**
   ```bash
   docker-compose up -d --build
   ```

2. **Check status**
   ```bash
   docker-compose ps
   ```

#### Option 2: Using Deployment Script

1. **Make script executable**
   ```bash
   chmod +x deploy.sh
   ```

2. **Deploy application**
   ```bash
   ./deploy.sh deploy
   ```

3. **Check deployment status**
   ```bash
   ./deploy.sh status
   ```

## 🐳 Docker Deployment

### Build Image
```bash
docker build -t wainso-web .
```

### Run Container
```bash
docker run -d --name wainso-web -p 80:80 wainso-web
```

### Using Docker Compose
```bash
# Start with SSL (recommended for production)
docker compose --profile ssl up -d

# Start without SSL (development)
docker compose up -d
```

## 🖥️ Server Setup

### Automated Setup (Ubuntu)

1. **Download and run the setup script**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/yourusername/wainsoweb/main/server-setup.sh | bash
   ```

2. **Follow the on-screen instructions**

### Manual Setup

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed server setup instructions.

## 📋 Available Scripts

### Development
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Deployment
- `./deploy.sh deploy` - Deploy application
- `./deploy.sh rollback` - Rollback to previous version
- `./deploy.sh health` - Check application health
- `./deploy.sh logs` - View application logs
- `./deploy.sh status` - Show deployment status

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=production
REACT_APP_API_URL=https://api.wainso.com
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Docker
COMPOSE_PROJECT_NAME=wainso
DOCKER_IMAGE_TAG=latest

# SSL
DOMAIN=wainso.com
EMAIL=admin@wainso.com
```

### Nginx Configuration

The application includes a production-ready Nginx configuration with:
- Gzip compression
- Security headers
- Static asset caching
- Health check endpoint
- Rate limiting

## 🔒 Security Features

- **HTTPS/SSL** - Automatic SSL certificate management with Let's Encrypt
- **Security Headers** - XSS protection, content type options, frame options
- **Rate Limiting** - API and login rate limiting
- **Non-root Container** - Containers run as non-root user
- **Firewall Configuration** - UFW firewall setup
- **Regular Updates** - Automated security updates

## 📊 Monitoring & Maintenance

### Health Checks
- Application health endpoint: `/health`
- Docker health checks
- Automated monitoring scripts

### Logging
- Application logs: `docker logs wainso-web`
- Nginx access/error logs
- Deployment logs: `/var/log/wainso-deploy.log`

### Backup Strategy
- Automated daily backups
- Docker image backups
- Application data backups
- 7-day retention policy

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Beautiful icons

### Backend & Infrastructure
- **Docker** - Containerization
- **Nginx** - Web server and reverse proxy
- **Traefik** - Load balancer and SSL termination
- **Let's Encrypt** - Free SSL certificates

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- 📧 Email: info@wainso.com
- 📱 Phone: +91 98765 43210
- 🌐 Website: [wainso.com](https://wainso.com)

## 🙏 Acknowledgments

- [Create React App](https://create-react-app.dev/) for the project setup
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Docker](https://www.docker.com/) for containerization
- [Nginx](https://nginx.org/) for the web server

---

**Built with ❤️ for professional security and tracking solutions**