import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// POST - Upload session recording
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, recordingUrl, duration, fileSize, consentGiven } = body;

    if (!sessionId || !recordingUrl) {
      return Response.json({ error: 'sessionId and recordingUrl required' }, { status: 400 });
    }

    if (!consentGiven) {
      return Response.json({ error: 'Recording consent not given' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Store recording metadata
    const recordingData = {
      url: recordingUrl,
      uploadedAt: new Date(),
      duration: duration || 0,
      fileSize: fileSize || 0,
      consentGiven: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days retention
    };

    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          'sessionData.recordingUrl': recordingUrl,
          'sessionData.recordingMetadata': recordingData
        }
      }
    );

    return Response.json({
      success: true,
      message: 'Recording uploaded successfully',
      expiresAt: recordingData.expiresAt
    });
  } catch (error) {
    console.error('Error uploading recording:', error);
    return Response.json({ error: 'Failed to upload recording' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// GET - Get recording URL (with access control)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!sessionId || !userId || !role) {
      return Response.json({ error: 'sessionId, userId, and role required' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Access control: only participants can access recording
    const isParticipant = 
      (role === 'student' && session.studentId.toString() === userId) ||
      (role === 'teacher' && session.teacherId.toString() === userId);

    if (!isParticipant) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if recording exists and hasn't expired
    if (!session.sessionData?.recordingUrl) {
      return Response.json({ error: 'Recording not available' }, { status: 404 });
    }

    const recordingMetadata = session.sessionData.recordingMetadata;
    if (recordingMetadata && new Date() > new Date(recordingMetadata.expiresAt)) {
      return Response.json({ error: 'Recording has expired' }, { status: 410 });
    }

    return Response.json({
      recordingUrl: session.sessionData.recordingUrl,
      metadata: recordingMetadata,
      accessGranted: true
    });
  } catch (error) {
    console.error('Error fetching recording:', error);
    return Response.json({ error: 'Failed to fetch recording' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// DELETE - Delete recording (admin or participant request)
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, reason } = body;

    if (!sessionId || !userId || !role) {
      return Response.json({ error: 'sessionId, userId, and role required' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Access control
    const isParticipant = 
      (role === 'student' && session.studentId.toString() === userId) ||
      (role === 'teacher' && session.teacherId.toString() === userId);

    if (!isParticipant && role !== 'admin') {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // In production, delete actual file from storage (S3, Cloudinary, etc.)
    // For now, just remove reference from database

    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          'sessionData.recordingUrl': null,
          'sessionData.recordingMetadata': {
            deletedAt: new Date(),
            deletedBy: userId,
            reason: reason || 'User requested deletion'
          }
        }
      }
    );

    return Response.json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting recording:', error);
    return Response.json({ error: 'Failed to delete recording' }, { status: 500 });
  } finally {
    await client.close();
  }
}
