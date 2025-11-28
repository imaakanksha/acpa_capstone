# ACPA Deployment Guide

This guide provides step-by-step instructions for deploying the Adaptive Climate Policy Analyst (ACPA) to production environments.

## Prerequisites

- Google Cloud Project with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- Access to a MySQL/TiDB database

## Local Docker Testing

Before deploying to the cloud, test the Docker image locally:

### 1. Build the Docker Image

```bash
docker build -t acpa-capstone:latest .
```

### 2. Run the Container Locally

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:3306/acpa_db" \
  -e JWT_SECRET="your-jwt-secret-key" \
  -e VITE_APP_ID="your-app-id" \
  -e OAUTH_SERVER_URL="https://oauth.example.com" \
  acpa-capstone:latest
```

### 3. Test the Application

Visit `http://localhost:3000` in your browser to verify the application is running.

## Google Cloud Run Deployment

### 1. Set Up Google Cloud Project

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  sqladmin.googleapis.com
```

### 2. Create a Cloud SQL Instance (if needed)

```bash
# Create a MySQL instance
gcloud sql instances create acpa-db \
  --database-version=MYSQL_8_0 \
  --tier=db-f1-micro \
  --region=us-central1

# Create a database
gcloud sql databases create acpa \
  --instance=acpa-db

# Create a database user
gcloud sql users create acpa-user \
  --instance=acpa-db \
  --password=your-secure-password
```

### 3. Build and Push to Container Registry

```bash
# Build the image
gcloud builds submit --tag gcr.io/$PROJECT_ID/acpa-capstone

# Verify the image was pushed
gcloud container images list --repository=gcr.io/$PROJECT_ID
```

### 4. Deploy to Cloud Run

```bash
# Deploy the service
gcloud run deploy acpa-capstone \
  --image gcr.io/$PROJECT_ID/acpa-capstone \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="mysql://user:password@cloudsql-host/acpa_db" \
  --set-env-vars JWT_SECRET="your-jwt-secret-key" \
  --set-env-vars VITE_APP_ID="your-app-id" \
  --set-env-vars OAUTH_SERVER_URL="https://oauth.example.com"
```

### 5. Configure Cloud SQL Proxy (if using Cloud SQL)

```bash
# Add Cloud SQL Proxy to your Cloud Run service
gcloud run services update acpa-capstone \
  --region us-central1 \
  --add-cloudsql-instances $PROJECT_ID:us-central1:acpa-db
```

### 6. Verify Deployment

```bash
# Get the service URL
gcloud run services describe acpa-capstone --region us-central1

# Test the service
curl https://acpa-capstone-xxxxx.a.run.app
```

## Environment Variables

The following environment variables must be set for the application to run:

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `VITE_APP_ID` | OAuth application ID | `app-123456` |
| `OAUTH_SERVER_URL` | OAuth server URL | `https://oauth.example.com` |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | `https://portal.example.com` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3000` |

## Monitoring and Logging

### View Cloud Run Logs

```bash
# Stream logs
gcloud run logs read acpa-capstone --region us-central1 --follow

# View specific log entries
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=acpa-capstone" \
  --limit 50 \
  --format json
```

### Set Up Monitoring

```bash
# Create an alert policy for high error rates
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="ACPA High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

## Scaling Configuration

### Auto-Scaling Settings

```bash
# Update Cloud Run service with scaling configuration
gcloud run services update acpa-capstone \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 100 \
  --concurrency 80
```

### Performance Tuning

- **Memory:** 2GB (adjustable based on agent workload)
- **CPU:** 2 (adjustable based on concurrent requests)
- **Timeout:** 3600 seconds (1 hour for long-running analyses)
- **Concurrency:** 80 requests per instance

## Database Migrations

### Run Migrations on Deployment

```bash
# Before deploying, ensure database schema is up to date
pnpm db:push

# Or manually run migrations
drizzle-kit migrate
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check database connectivity
gcloud sql connect acpa-db --user=acpa-user

# Verify Cloud SQL Proxy is configured
gcloud run services describe acpa-capstone --region us-central1
```

#### 2. Memory/CPU Issues

```bash
# Increase resource allocation
gcloud run services update acpa-capstone \
  --region us-central1 \
  --memory 4Gi \
  --cpu 4
```

#### 3. Timeout Issues

```bash
# Increase timeout for long-running operations
gcloud run services update acpa-capstone \
  --region us-central1 \
  --timeout 7200
```

## Continuous Deployment

### Set Up Cloud Build Trigger

```bash
# Create a Cloud Build trigger from GitHub
gcloud builds triggers create github \
  --name=acpa-capstone-trigger \
  --repo-name=acpa-capstone \
  --repo-owner=your-github-username \
  --branch-pattern=^main$ \
  --build-config=cloudbuild.yaml
```

### Create cloudbuild.yaml

```yaml
steps:
  # Build the Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/acpa-capstone', '.']

  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/acpa-capstone']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=.
      - --image=gcr.io/$PROJECT_ID/acpa-capstone
      - --location=us-central1
      - --output=/workspace/output

images:
  - 'gcr.io/$PROJECT_ID/acpa-capstone'
```

## Rollback Procedure

### Rollback to Previous Version

```bash
# List previous revisions
gcloud run revisions list --service=acpa-capstone --region=us-central1

# Route traffic to a previous revision
gcloud run services update-traffic acpa-capstone \
  --region us-central1 \
  --to-revisions REVISION_ID=100
```

## Cost Optimization

### Reduce Costs

1. **Use smaller instances for non-critical workloads**
   ```bash
   gcloud run services update acpa-capstone \
     --region us-central1 \
     --memory 512Mi \
     --cpu 1
   ```

2. **Set appropriate min-instances**
   ```bash
   gcloud run services update acpa-capstone \
     --region us-central1 \
     --min-instances 0
   ```

3. **Use regional endpoints instead of global**
   - Deploy to specific regions closer to users

## Security Considerations

### Enable Authentication

```bash
# Require authentication for Cloud Run service
gcloud run services update acpa-capstone \
  --region us-central1 \
  --no-allow-unauthenticated
```

### Set Up IAM Roles

```bash
# Grant Cloud Run Invoker role
gcloud run services add-iam-policy-binding acpa-capstone \
  --region us-central1 \
  --member=serviceAccount:your-service-account@PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

### Use Secret Manager

```bash
# Store sensitive data in Secret Manager
gcloud secrets create database-url \
  --data-file=- <<< "mysql://user:pass@host/db"

# Reference in Cloud Run
gcloud run services update acpa-capstone \
  --region us-central1 \
  --set-env-vars DATABASE_URL=projects/PROJECT_ID/secrets/database-url/latest
```

## Support and Maintenance

For issues or questions about deployment, refer to:
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)

---

**Last Updated:** November 2025
