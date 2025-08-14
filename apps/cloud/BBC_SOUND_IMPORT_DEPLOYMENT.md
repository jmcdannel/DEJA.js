# BBC Sound Import API - Deployment Guide

## 🚀 Overview

This guide walks you through deploying the BBC Sound Import API on Vercel with multiple storage options. The solution automatically downloads BBC sound effects, stores them in cloud storage, and integrates them into your DEJA sound system.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Vercel API    │    │   Cloud Storage │
│   (Vue App)     │◄──►│   Route         │◄──►│   (Vercel Blob) │
│                 │    │                 │    │                 │
│ BBC Importer    │    │ /api/bbc-sounds │    │ Audio Files     │
│ Component       │    │ /import         │    │ + Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   BBC API       │              │
         │              │   (External)    │              │
         │              │                 │              │
         │              │ Metadata +      │              │
         │              │ Audio Download  │              │
         └──────────────┴─────────────────┴──────────────┘
```

## 📋 Prerequisites

- ✅ **Vercel Account** - For hosting and API routes
- ✅ **Vercel CLI** - For deployment and configuration
- ✅ **BBC Sound Effects Account** - For API access (optional)
- 🔧 **Environment Variables** - Configured for your setup

## 🎯 Storage Options

### 1. **Vercel Blob Storage** ⭐ **RECOMMENDED**

**Best for**: Quick setup, small to medium collections, Vercel-native integration

#### Setup Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Create Blob Store**:
   ```bash
   vercel blob create bbc-sounds
   ```

4. **Get Blob Token**:
   ```bash
   vercel env pull .env.local
   ```

5. **Set Environment Variable**:
   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN
   # Paste the token from step 3
   ```

#### Environment Variables:
```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here
```

#### Benefits:
- ✅ Native Vercel integration
- ✅ Automatic HTTPS and CDN
- ✅ Simple setup
- ✅ Global edge locations
- ✅ Automatic scaling

#### Limitations:
- ❌ 100GB storage limit on Hobby plan
- ❌ No automatic backup
- ❌ Limited to Vercel ecosystem

---

### 2. **Firebase Storage** 🔥 **GOOD ALTERNATIVE**

**Best for**: Large collections, existing Firebase users, backup storage

#### Setup Steps:

1. **Enable Firebase Storage** in your Firebase Console
2. **Set Storage Rules** for public access:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /sounds/bbc/{allPaths=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Get Storage Bucket Name** from Firebase Console

#### Environment Variables:
```env
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

#### Benefits:
- ✅ Generous free tier (5GB)
- ✅ Good for large collections
- ✅ Already integrated in your app
- ✅ Automatic backup and versioning

#### Limitations:
- ❌ Requires separate Firebase setup
- ❌ More complex configuration
- ❌ Additional service dependency

---

### 3. **AWS S3** ☁️ **ENTERPRISE CHOICE**

**Best for**: Enterprise users, unlimited storage, cost optimization

#### Setup Steps:

1. **Create S3 Bucket** with public read access
2. **Configure CORS** for web access
3. **Set Bucket Policy** for public read
4. **Install AWS SDK**:
   ```bash
   pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
   ```

#### Environment Variables:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

#### Benefits:
- ✅ Unlimited storage
- ✅ Very cost-effective for large volumes
- ✅ Enterprise-grade reliability
- ✅ Advanced features (lifecycle, versioning)

#### Limitations:
- ❌ Complex setup
- ❌ Requires AWS account
- ❌ Additional dependencies

---

### 4. **Cloudinary** 🎵 **AUDIO SPECIALIST**

**Best for**: Media optimization, automatic format conversion, CDN

#### Setup Steps:

1. **Create Cloudinary Account**
2. **Get API Credentials**
3. **Install SDK**:
   ```bash
   pnpm add cloudinary
   ```

#### Environment Variables:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Benefits:
- ✅ Optimized for media files
- ✅ Automatic format conversion
- ✅ Built-in CDN
- ✅ Good free tier

#### Limitations:
- ❌ More expensive for storage
- ❌ Requires separate service
- ❌ Additional complexity

## 🚀 Deployment Steps

### Step 1: Configure Environment Variables

1. **Copy the template**:
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your values**:
   ```env
   # For Vercel Blob (recommended)
   VITE_VERCEL_BLOB_TOKEN=your_token_here
   
   # For Firebase Storage (fallback)
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   ```

### Step 2: Deploy to Vercel

1. **Deploy the app**:
   ```bash
   vercel --prod
   ```

2. **Set environment variables**:
   ```bash
   vercel env add VITE_VERCEL_BLOB_TOKEN
   vercel env add VITE_FIREBASE_STORAGE_BUCKET
   ```

3. **Redeploy with new env vars**:
   ```bash
   vercel --prod
   ```

### Step 3: Test the API

1. **Test the endpoint**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/bbc-sounds/import \
     -H "Content-Type: application/json" \
     -d '{
       "bbcUrl": "https://sound-effects.bbcrewind.co.uk/search?q=train",
       "category": "train"
     }'
   ```

2. **Check the response**:
   ```json
   {
     "success": true,
     "result": {
       "soundId": "bbc-train",
       "filePath": "https://blob.vercel-storage.com/...",
       "metadata": { ... }
     }
   }
   ```

## 🔧 Configuration Options

### BBC API Integration

```typescript
// In src/config/bbc-api.ts
export const BBC_API_CONFIG = {
  // Rate limiting
  rateLimit: {
    requestsPerMinute: 60,
    delayBetweenRequests: 1000,
  },
  
  // Audio quality
  audioQuality: {
    preferredFormat: 'mp3',
    preferredBitrate: '128k',
    maxDuration: 300000, // 5 minutes
  },
  
  // Storage fallback
  storage: {
    primary: { type: 'vercel-blob' },
    fallback: { type: 'firebase-storage' },
  }
}
```

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "api/bbc-sounds/import.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "BLOB_READ_WRITE_TOKEN": "@blob-read-write-token"
  }
}
```

## 🧪 Testing

### Local Development

1. **Start the dev server**:
   ```bash
   pnpm dev
   ```

2. **Test the importer**:
turbo dev   - Navigate to `/effects` and click "BBC Sound Importer"
   - Or go directly to `/effects/bbc-importer`
   - Paste a BBC sound URL
   - Select category and import

3. **Test the 404 page**:
   - Navigate to any non-existent route (e.g., `/derailed-train`)
   - Enjoy the train-themed 404 page with puns!

### Production Testing

1. **Deploy to staging**:
   ```bash
   vercel
   ```

2. **Test the API endpoint**
3. **Verify file storage**
4. **Test the 404 page**
5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## 📊 Monitoring & Analytics

### Vercel Analytics

- **Function Logs**: View API execution logs
- **Performance**: Monitor response times
- **Errors**: Track failed requests
- **Usage**: Monitor function invocations

### Storage Monitoring

- **Vercel Blob**: Check storage usage in dashboard
- **Firebase**: Monitor storage in Firebase Console
- **AWS S3**: Use CloudWatch for metrics

## 🚨 Troubleshooting

### Common Issues

1. **"Method not allowed"**:
   - Ensure you're using POST method
   - Check API route configuration

2. **"Storage configuration not available"**:
   - Verify environment variables
   - Check storage service setup

3. **"BBC API error"**:
   - Verify BBC URL format
   - Check rate limiting
   - Validate API credentials

4. **"File upload failed"**:
   - Check storage permissions
   - Verify storage tokens
   - Monitor storage quotas

### Debug Mode

Enable debug logging:

```typescript
// In the API route
console.log('Request body:', req.body)
console.log('Storage config:', getStorageConfig())
console.log('BBC metadata:', metadata)
```

## 🔒 Security & Licensing Considerations

### BBC Licensing Requirements

Based on the [BBC Sound Effects licensing terms](https://sound-effects.bbcrewind.co.uk/licensing):

- ✅ **Proper Attribution**: All sounds must credit "BBC Sound Effects Library"
- ✅ **License Compliance**: Follow BBC RemArc Licence terms
- ✅ **Usage Restrictions**: Educational and personal use only
- ✅ **Commercial Licensing**: Commercial use requires separate licensing
- ✅ **Metadata Preservation**: Keep all licensing information intact
- ✅ **Visible Attribution**: Attribution must be prominent and visible

### API Security

- ✅ **Rate limiting** to prevent abuse
- ✅ **Input validation** for URLs and parameters
- ✅ **Authentication** for file uploads (optional)
- ✅ **CORS configuration** for web access

### Storage Security

- ✅ **Public read access** for audio files
- ✅ **Authenticated write access** for uploads
- ✅ **File type validation** (MP3 only)
- ✅ **Size limits** to prevent abuse

## 📈 Scaling Considerations

### Performance Optimization

- **CDN**: Use Vercel's global edge network
- **Caching**: Implement response caching
- **Compression**: Optimize audio file sizes
- **Batch processing**: Handle multiple imports

### Cost Optimization

- **Storage tiers**: Choose appropriate storage class
- **CDN usage**: Monitor bandwidth costs
- **Function optimization**: Minimize execution time
- **Storage lifecycle**: Implement cleanup policies

## 🎯 Next Steps

### Immediate Actions

1. ✅ **Choose storage solution** (Vercel Blob recommended)
2. ✅ **Set up environment variables**
3. ✅ **Deploy to Vercel**
4. ✅ **Test the API endpoint**

### Future Enhancements

1. 🔄 **Real BBC API integration**
2. 🔄 **Advanced audio processing**
3. 🔄 **Batch import capabilities**
4. 🔄 **Audio format conversion**
5. 🔄 **Metadata enrichment**
6. 🔄 **Usage analytics**

## 📚 Additional Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Firebase Storage Guide](https://firebase.google.com/docs/storage)
- [AWS S3 Best Practices](https://aws.amazon.com/s3/best-practices/)
- [BBC Sound Effects API](https://sound-effects.bbcrewind.co.uk/api)

---

## 🆘 Support

If you encounter issues:

1. **Check the logs** in Vercel dashboard
2. **Verify environment variables**
3. **Test with simple URLs first**
4. **Check storage service status**
5. **Review this documentation**

For additional help, refer to the main project documentation or create an issue in the repository.
