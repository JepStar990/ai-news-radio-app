# Deployment Guide - Decoupled Architecture

This guide covers deploying the frontend and backend independently to different hosting platforms.

## Architecture Overview

The application is now split into two independent parts:
- **Frontend (client/)**: React application that can be deployed as static files
- **Backend (server/)**: Express API server that can be deployed to any Node.js hosting platform

## Environment Configuration

### Frontend Environment Variables
Create a `.env` file in the `client/` directory:

```env
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Backend Environment Variables
Create a `.env` file in the `server/` directory:

```env
# Required
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_connection_string

# Optional
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

## Frontend Deployment

### Build Process
```bash
cd client
npm install
npm run build
```

This creates a `dist/` folder with static files ready for deployment.

### Deployment Options

#### Netlify
1. Connect your repository to Netlify
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Add environment variable: `VITE_API_BASE_URL`

#### Vercel
1. Import your repository to Vercel
2. Set root directory to `client`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_BASE_URL`

#### AWS S3 + CloudFront
1. Build the application locally
2. Upload `client/dist/` contents to S3 bucket
3. Configure CloudFront distribution
4. Set custom domain and SSL certificate

## Backend Deployment

### Build Process
```bash
cd server
npm install
npm run build
```

### Deployment Options

#### Railway
1. Connect repository to Railway
2. Set root directory to `server`
3. Add environment variables
4. Deploy automatically on push

#### Render
1. Create new Web Service on Render
2. Set root directory: `server`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

#### Heroku
1. Create new Heroku app
2. Set buildpacks to Node.js
3. Configure environment variables
4. Deploy via Git or GitHub integration

#### DigitalOcean App Platform
1. Create new app from repository
2. Configure Node.js service
3. Set source directory to `server`
4. Add environment variables
5. Configure auto-deploy

## Database Setup

### PostgreSQL Options

#### Neon (Recommended)
1. Create account at neon.tech
2. Create new database
3. Copy connection string to `DATABASE_URL`

#### Supabase
1. Create project at supabase.com
2. Get database URL from settings
3. Set as `DATABASE_URL` environment variable

#### Railway PostgreSQL
1. Add PostgreSQL plugin to Railway project
2. Use provided `DATABASE_URL`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `http://localhost:5000` (development)
- Your custom frontend URL (via `FRONTEND_URL` env var)

Update the `FRONTEND_URL` environment variable in production.

## SSL and Security

### Frontend Security
- Enable HTTPS on your hosting platform
- Configure proper CSP headers
- Set up proper redirects (HTTP → HTTPS)

### Backend Security
- Use HTTPS for API endpoints
- Configure proper CORS origins
- Secure environment variables
- Enable rate limiting in production

## Production Checklist

### Frontend Deployment
- [ ] Build completes without errors
- [ ] `VITE_API_BASE_URL` points to production backend
- [ ] SSL certificate configured
- [ ] Custom domain configured (optional)
- [ ] CDN configured for global distribution

### Backend Deployment
- [ ] All environment variables set
- [ ] Database connection working
- [ ] OpenAI API key valid and has quota
- [ ] CORS configured for frontend domain
- [ ] Health check endpoint responding
- [ ] Logging and monitoring configured

## Development vs Production

### Development (Current Setup)
- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:5000`
- Uses in-memory storage
- Hot reloading enabled

### Production (Decoupled)
- Frontend: Static files on CDN/hosting platform
- Backend: API server on Node.js platform
- PostgreSQL database
- Environment-based configuration

## Monitoring and Maintenance

### Frontend Monitoring
- Analytics integration (Google Analytics, etc.)
- Error tracking (Sentry, LogRocket)
- Performance monitoring (Core Web Vitals)

### Backend Monitoring
- API performance monitoring
- Database connection health
- OpenAI API usage tracking
- Error logging and alerting

## Scaling Considerations

### Frontend Scaling
- CDN for global distribution
- Caching strategies
- Bundle size optimization
- Image optimization

### Backend Scaling
- Horizontal scaling (multiple instances)
- Database connection pooling
- Redis caching layer
- Load balancing

## Common Issues and Solutions

### CORS Errors
- Verify `FRONTEND_URL` environment variable
- Check CORS configuration in `server/index.ts`
- Ensure protocol (HTTP/HTTPS) matches

### Environment Variable Issues
- Frontend: Must start with `VITE_`
- Backend: Check all required variables are set
- Use deployment platform's environment variable UI

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check network connectivity
- Ensure database accepts external connections

### OpenAI API Issues
- Verify API key is valid
- Check remaining quota/billing
- Monitor rate limits and usage

## Support and Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)