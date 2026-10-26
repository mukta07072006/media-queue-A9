import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get video session details
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json({ error: 'Session ID required' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne(
      { sessionId },
      { projection: { sessionData: 1, status: 1, studentId: 1, teacherId: 1 } }
    );

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    return Response.json({
      sessionId: session.sessionId,
      status: session.status,
      recordingUrl: session.sessionData?.recordingUrl,
      whiteboardData: session.sessionData?.whiteboardData,
      sharedPhotos: session.sessionData?.sharedPhotos
    });
  } catch (error) {
    console.error('Error fetching video session:', error);
    return Response.json({ error: 'Failed to fetch video session' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Create/join video session
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, recordingConsent } = body;

    if (!sessionId || !userId || !role) {
      return Response.json({ error: 'sessionId, userId, and role required' }, { status: 400 });
    }

    if (!['student', 'teacher'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update join tracking
    const updateField = role === 'teacher' 
      ? 'joinTracking.teacherJoinedAt' 
      : 'joinTracking.studentJoinedAt';

    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          [updateField]: new Date(),
          'sessionData.recordingConsent': recordingConsent || false
        }
      }
    );

    // Check if both joined and update status
    const updatedSession = await sessionsCollection.findOne({ sessionId });
    if (updatedSession.joinTracking.teacherJoinedAt && updatedSession.joinTracking.studentJoinedAt) {
      await sessionsCollection.updateOne(
        { sessionId },
        {
          $set: {
            status: 'in_progress',
            actualStartTime: new Date()
          }
        }
      );
    }

    // Generate video token (placeholder - integrate with real video SDK)
    const videoToken = generateVideoToken(sessionId, userId, role);

    return Response.json({
      success: true,
      sessionId,
      videoToken,
      role,
      recordingEnabled: recordingConsent || false,
      message: 'Video session initialized successfully'
    });
  } catch (error) {
    console.error('Error creating video session:', error);
    return Response.json({ error: 'Failed to create video session' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PUT - End video session
export async function PUT(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, recordingUrl, whiteboardData } = body;

    if (!sessionId || !userId || !role) {
      return Response.json({ error: 'sessionId, userId, and role required' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');
    const usersCollection = db.collection('users');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update session data
    const updateData = {
      status: 'completed',
      actualEndTime: new Date(),
      'sessionData.recordingUrl': recordingUrl || null,
      'sessionData.whiteboardData': whiteboardData || {}
    };

    await sessionsCollection.updateOne(
      { sessionId },
      { $set: updateData }
    );

    // Calculate session duration and update teacher credit score
    if (session.actualStartTime) {
      const duration = Math.floor((new Date() - new Date(session.actualStartTime)) / 1000 / 60); // minutes
      
      // Update teacher credit score for completed session
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/credit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: session.teacherId,
          action: 'session_completed',
          sessionId: session._id,
          reason: `Completed ${duration} minute session`
        })
      });

      // Pay teacher
      const teacher = await usersCollection.findOne(
        { _id: session.teacherId },
        { projection: { earnings: 1 } }
      );

      if (teacher) {
        await usersCollection.updateOne(
          { _id: session.teacherId },
          {
            $inc: {
              'earnings.total': session.payment.amount,
              'earnings.available': session.payment.amount
            }
          }
        );
      }
    }

    return Response.json({
      success: true,
      status: 'completed',
      message: 'Video session ended successfully'
    });
  } catch (error) {
    console.error('Error ending video session:', error);
    return Response.json({ error: 'Failed to end video session' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Placeholder function - replace with actual video SDK token generation
function generateVideoToken(sessionId, userId, role) {
  // This is a placeholder. In production, integrate with:
  // - Twilio Video
  // - Agora
  // - Daily.co
  // - Whereby
  // Or build custom WebRTC implementation
  
  return {
    sessionId,
    userId,
    role,
    token: `placeholder_token_${sessionId}_${userId}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  };
}
