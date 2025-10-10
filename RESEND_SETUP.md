# Resend API Setup Guide

## Langkah 1: Dapatkan API Key dari Resend

1. **Login ke Resend:**
   - Buka: https://resend.com/login
   - Login dengan akun Anda

2. **Buka API Keys:**
   - Dashboard → API Keys (di sidebar kiri)
   - Atau langsung: https://resend.com/api-keys

3. **Create atau Copy API Key:**
   - Jika belum ada: Klik "Create API Key"
   - Jika sudah ada: Copy existing key
   - **PENTING:** API key format: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Test API Key (Optional):**
   ```bash
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "onboarding@resend.dev",
       "to": "your-email@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

## Langkah 2: Tambahkan ke Vercel

1. **Buka Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Pilih project Anda

2. **Masuk ke Settings:**
   - Klik tab "Settings"
   - Pilih "Environment Variables" di sidebar

3. **Tambahkan RESEND_API_KEY:**
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` (paste API key dari Resend)
   - Environment: Pilih **Production**, **Preview**, dan **Development**
   - Klik "Save"

4. **PENTING - Redeploy:**
   - Setelah menambah/update env var, HARUS redeploy
   - Cara 1: Push commit baru ke Git
   - Cara 2: Manual redeploy di Vercel Dashboard → Deployments → "..." → Redeploy

## Langkah 3: Verify di Vercel

1. **Cek Environment Variables:**
   - Settings → Environment Variables
   - Pastikan `RESEND_API_KEY` ada dan ter-set untuk Production

2. **Cek Logs:**
   - Deployments → Latest Deployment → View Function Logs
   - Cari log: `RESEND_API_KEY: SET` atau `NOT SET`

## Common Issues

### Issue 1: API Key Invalid (401 Error)
**Penyebab:**
- API key salah/typo
- API key expired/revoked
- Ada spasi di awal/akhir API key

**Solusi:**
1. Generate API key baru di Resend
2. Copy dengan hati-hati (jangan ada spasi)
3. Update di Vercel
4. Redeploy

### Issue 2: API Key Not Found
**Penyebab:**
- Environment variable belum di-set di Vercel
- Belum redeploy setelah set env var

**Solusi:**
1. Cek Settings → Environment Variables
2. Pastikan ada `RESEND_API_KEY`
3. Redeploy aplikasi

### Issue 3: Email Tidak Terkirim
**Penyebab:**
- Sender email tidak verified
- Recipient email invalid
- Rate limit exceeded

**Solusi:**
1. Gunakan `onboarding@resend.dev` untuk testing
2. Atau verify domain Anda di Resend
3. Cek quota di Resend dashboard

## Testing

### Test di Local:
```bash
# Di .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Run dev server
bun dev

# Test endpoint
curl http://localhost:3000/api/test-email-simple
```

### Test di Production:
```bash
# Setelah deploy
curl https://your-app.vercel.app/api/test-email-simple
```

## Troubleshooting Checklist

- [ ] API key format benar: `re_xxxxx...`
- [ ] API key di-copy tanpa spasi
- [ ] Environment variable name: `RESEND_API_KEY` (exact)
- [ ] Ter-set untuk Production environment
- [ ] Sudah redeploy setelah set env var
- [ ] API key masih valid (tidak expired/revoked)
- [ ] Resend account masih active
- [ ] Belum exceed rate limit

## Rate Limits (Free Tier)

- **100 emails/day**
- **3,000 emails/month**
- Jika exceed, upgrade ke paid plan

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com
- Vercel Docs: https://vercel.com/docs/environment-variables
