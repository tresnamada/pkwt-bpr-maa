# 🚀 Setup Environment Variables di Netlify

## 🔑 Firebase Admin SDK Environment Variables

Untuk fitur **Create Admin** berfungsi di production, Anda perlu menambahkan 3 environment variables di Netlify.

---

## 📋 Langkah-Langkah Setup

### **Step 1: Buka Firebase Service Account File**

1. Buka file `firebase-service-account.json` di local project Anda
2. File ini berisi kredensial Firebase Admin SDK
3. **JANGAN commit file ini ke Git!** (sudah di-gitignore)

### **Step 2: Copy Values dari Service Account**

Dari file `firebase-service-account.json`, copy 3 values ini:

```json
{
  "project_id": "your-project-id",           // ← Copy ini
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // ← Copy ini
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com" // ← Copy ini
}
```

### **Step 3: Tambahkan ke Netlify Environment Variables**

1. **Login ke Netlify Dashboard**
   - URL: https://app.netlify.com

2. **Pilih Site Anda**
   - Klik site `pkwt-bpr-maa` (atau nama site Anda)

3. **Buka Site Settings**
   - Klik **Site configuration** → **Environment variables**

4. **Tambahkan 3 Variables Baru:**

#### **Variable 1: FIREBASE_PROJECT_ID**
```
Key:   FIREBASE_PROJECT_ID
Value: your-project-id
```
*Contoh: `pkwt-bpr-maa-12345`*

#### **Variable 2: FIREBASE_CLIENT_EMAIL**
```
Key:   FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
```
*Contoh: `firebase-adminsdk-abc123@pkwt-bpr-maa.iam.gserviceaccount.com`*

#### **Variable 3: FIREBASE_PRIVATE_KEY**
```
Key:   FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...
```

**⚠️ PENTING untuk FIREBASE_PRIVATE_KEY:**
- Copy **SELURUH private key** termasuk `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`
- Pastikan `\n` (newline) tetap ada di dalam string
- Jangan tambah atau hapus karakter apapun

### **Step 4: Save & Redeploy**

1. Klik **Save** setelah menambahkan semua variables
2. **Trigger redeploy:**
   - Buka **Deploys** tab
   - Klik **Trigger deploy** → **Deploy site**
3. Tunggu build selesai (2-3 menit)

---

## ✅ Verifikasi Setup

### **Test di Production:**

1. **Login sebagai Super Admin:**
   - URL: `https://your-site.netlify.app/login`
   - Email: `sdm@bprmaa.com`
   - Password: `123456`

2. **Buka Admin Management:**
   - URL: `https://your-site.netlify.app/branch-admin-management`

3. **Buat Admin Baru:**
   - Klik "Tambah Admin Baru"
   - Isi form dan submit
   - **Jika berhasil:** Admin baru dibuat tanpa error ✅
   - **Jika error:** Check Netlify Function logs

---

## 🔍 Troubleshooting

### **Error: "Missing or insufficient permissions"**

**Penyebab:** Environment variables belum di-set atau salah

**Solusi:**
1. Verify semua 3 variables ada di Netlify
2. Check tidak ada typo di key names
3. Pastikan values di-copy dengan benar (terutama private key)
4. Redeploy site setelah update variables

### **Error: "Invalid private key"**

**Penyebab:** Private key tidak di-copy dengan benar

**Solusi:**
1. Copy ulang `private_key` dari `firebase-service-account.json`
2. Pastikan `\n` tetap ada (jangan replace dengan actual newline)
3. Format yang benar:
   ```
   -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n
   ```

### **Error: "Module not found: firebase-service-account.json"**

**Penyebab:** Environment variables belum di-set, code fallback ke file

**Solusi:**
1. Set 3 environment variables di Netlify
2. Redeploy site
3. File `firebase-service-account.json` hanya untuk local development

---

## 📝 Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | `pkwt-bpr-maa-12345` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-xxx@project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Private key (with `\n`) | `-----BEGIN PRIVATE KEY-----\n...` |

---

## 🔐 Security Best Practices

1. **JANGAN commit `firebase-service-account.json` ke Git**
   - File sudah di-gitignore
   - Berisi kredensial sensitif

2. **JANGAN share environment variables**
   - Hanya admin yang perlu akses
   - Jangan screenshot atau copy-paste ke public

3. **Rotate keys secara berkala**
   - Generate new service account key setiap 6-12 bulan
   - Update environment variables di Netlify

4. **Monitor Firebase Console**
   - Check untuk suspicious activity
   - Review Firebase Admin SDK usage

---

## 🎯 Cara Kerja

### **Local Development:**
```typescript
// Code akan gunakan firebase-service-account.json
const serviceAccount = require('../../../../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
```

### **Production (Netlify):**
```typescript
// Code akan gunakan environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});
```

---

## 📞 Support

Jika masih ada error setelah setup:

1. **Check Netlify Function Logs:**
   - Netlify Dashboard → Functions → View logs
   - Cari error message dari Firebase Admin

2. **Check Firebase Console:**
   - Service Accounts → Verify email ada
   - IAM & Admin → Check permissions

3. **Test Local First:**
   - Pastikan fitur berfungsi di local
   - Baru deploy ke production

---

**Dibuat**: 24 Oktober 2025  
**Version**: 1.0.0  
**Status**: ✅ Ready for Production
