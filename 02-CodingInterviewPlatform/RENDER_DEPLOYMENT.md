# Deploying to Render

This guide walks you through deploying the Coding Interview Platform to Render using Docker.

## Prerequisites

- A [Render](https://render.com) account (free tier works)
- Your code pushed to a GitHub repository
- Git installed on your local machine

## Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Coding Interview Platform"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Log in to Render Dashboard**
   - Go to [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in with your account

2. **Create New Blueprint Instance**
   - Click **"New +"** button in the top right
   - Select **"Blueprint"**

3. **Connect Your Repository**
   - Click **"Connect GitHub"** (or use your existing connection)
   - Select your repository from the list
   - Click **"Connect"**

4. **Deploy from Blueprint**
   - Render will automatically detect the `render.yaml` file
   - Review the configuration:
     - Service Name: `coding-interview-platform`
     - Environment: `docker`
     - Health Check Path: `/api/health`
   - Click **"Apply"** to start deployment

5. **Wait for Build**
   - Render will build your Docker image (this takes 3-5 minutes)
   - You can watch the build logs in real-time
   - The deployment is complete when you see "Your service is live 🎉"

### Option B: Manual Setup

If you prefer manual configuration:

1. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Select your GitHub repository
   - Click **"Connect"**

3. **Configure Service**
   - **Name**: `coding-interview-platform`
   - **Environment**: Select **"Docker"**
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Plan**: Free

4. **Advanced Settings**
   - **Health Check Path**: `/api/health`
   - **Environment Variables**: (optional)
     - `NODE_ENV`: `production`

5. **Create Web Service**
   - Click **"Create Web Service"**
   - Wait for deployment to complete

## Step 3: Access Your Application

Once deployed, Render provides a URL like:
```
https://coding-interview-platform.onrender.com
```

Click on the URL to open your deployed application!

## Step 4: Test Your Deployment

1. **Create a Room**: Click "Create New Room" button
2. **Copy the Room ID** from the URL
3. **Open in Another Tab**: Paste the URL in a new browser tab
4. **Test Real-time Sync**: Type code in one tab and verify it appears in the other
5. **Test Code Execution**: 
   - Switch to JavaScript or Python
   - Write and run code
   - Verify output appears correctly

## Updating Your Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Render will automatically detect the push and redeploy
```

## Troubleshooting

### Build Fails

- Check the build logs in Render dashboard
- Verify your Dockerfile works locally: `docker build -t test .`
- Ensure all dependencies are in package.json

### WebSocket Connection Issues

- WebSockets work on Render's free tier
- Check browser console for connection errors
- Verify the health check endpoint returns 200 OK

### Application Not Loading

1. Check deployment logs in Render dashboard
2. Verify the build completed successfully
3. Check that port 3000 is exposed in your Dockerfile (already configured)

### Free Tier Limitations

- **Services spin down after 15 minutes of inactivity**
- First request after inactivity takes 30-60 seconds to wake up
- Upgrade to paid plan for always-on service

## Cost

- **Free Tier**: $0/month
  - 750 hours per month
  - Services sleep after inactivity
  - Perfect for demos and testing

- **Starter Plan**: $7/month
  - Always-on service
  - No sleeping
  - Better for production use

## Next Steps

- **Custom Domain**: Add your own domain in Render settings
- **Environment Variables**: Add API keys or configuration via dashboard
- **Monitoring**: View logs and metrics in Render dashboard
- **Scaling**: Upgrade plan for better performance

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check deployment logs for specific errors
