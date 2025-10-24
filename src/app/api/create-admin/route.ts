import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use environment variables first (for production)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        })
      });
    } else {
      // Fallback to service account file (for local development)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const serviceAccount = require('../../../../firebase-service-account.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    const { email, password, branch, role, createdBy } = await request.json();

    // Validate input
    if (!email || !password || !branch || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth using Admin SDK
    // This won't affect the current user's session
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false
    });

    // Create branch admin record in Firestore
    const adminData = {
      email,
      branch,
      role,
      createdBy: createdBy || 'system',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await db.collection('branchAdmins').add(adminData);

    return NextResponse.json({
      success: true,
      message: `Admin ${email} berhasil dibuat`,
      userId: userRecord.uid
    });

  } catch (error: unknown) {
    console.error('Error creating admin:', error);
    
    const err = error as { code?: string; message?: string };
    let errorMessage = 'Gagal membuat admin';

    switch (err.code) {
      case 'auth/email-already-exists':
        errorMessage = 'Email sudah digunakan';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Format email tidak valid';
        break;
      case 'auth/invalid-password':
        errorMessage = 'Password tidak valid';
        break;
      default:
        errorMessage = err.message || 'Gagal membuat admin';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
