# 🚀 Innovista POS System - Deployment Quick Reference

For full detailed documentation, architecture diagrams, and complete deployment steps, please refer to:
👉 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

---

## ⚡ Quick Deployment Commands

### 1. Local Development
```bash
npm install
npm run dev
```

### 2. Production Build & Run
```bash
npm run build
npm start
```

### 3. Docker Container
```bash
docker build -t innovista-pos:latest .
docker run -d -p 3000:3000 -e GEMINI_API_KEY="your-key" -v pos_data:/app/data innovista-pos:latest
```

### 4. Docker Compose
```bash
docker-compose up -d
```

### 5. Google Cloud Run
```bash
gcloud run deploy innovista-pos \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 3000
```
