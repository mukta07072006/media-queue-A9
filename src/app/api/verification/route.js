import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get verification status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { verificationStatus: 1, verificationDocuments: 1, name: 1, email: 1 } }
    );

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      status: user.verificationStatus || 'pending',
      documents: user.verificationDocuments || null
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return Response.json({ error: 'Failed to fetch verification status' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Submit verification documents
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, nidNumber, nidImage, credentials } = body;

    if (!userId || !nidNumber || !nidImage) {
      return Response.json({ error: 'userId, nidNumber, and nidImage are required' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');
    const teachersCollection = db.collection('teachers');

    // Update user verification documents
    const verificationDocuments = {
      nidNumber,
      nidImage,
      credentials: credentials || [],
      submittedAt: new Date()
    };

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verificationStatus: 'pending',
          verificationDocuments
        }
      }
    );

    // Update teacher profile status if exists
    const teacher = await teachersCollection.findOne({ userId: new ObjectId(userId) });
    if (teacher) {
      await teachersCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { status: 'pending' } }
      );
    }

    return Response.json({
      success: true,
      message: 'Verification documents submitted successfully. Our team will review within 24-48 hours.'
    });
  } catch (error) {
    console.error('Error submitting verification:', error);
    return Response.json({ error: 'Failed to submit verification documents' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PUT - Admin: Approve/Reject verification
export async function PUT(request) {
  try {
    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return Response.json({ error: 'userId and action required' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');
    const teachersCollection = db.collection('teachers');

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verificationStatus: newStatus,
          'verificationDocuments.reviewedAt': new Date(),
          'verificationDocuments.reviewReason': reason || ''
        }
      }
    );

    // Update teacher profile status
    if (action === 'approve') {
      await teachersCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { status: 'approved' } }
      );
    } else {
      await teachersCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { status: 'suspended' } }
      );
    }

    return Response.json({
      success: true,
      status: newStatus,
      message: action === 'approve' 
        ? 'Teacher verified successfully' 
        : 'Teacher verification rejected'
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    return Response.json({ error: 'Failed to update verification status' }, { status: 500 });
  } finally {
    await client.close();
  }
}
