import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// POST - Upload photo during session
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, photoUrl, description, contentType } = body;

    if (!sessionId || !userId || !role || !photoUrl) {
      return Response.json({ error: 'sessionId, userId, role, and photoUrl required' }, { status: 400 });
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

    if (session.status !== 'in_progress') {
      return Response.json({ error: 'Photo sharing only allowed during active sessions' }, { status: 400 });
    }

    // Validate content type (restrict to academic content)
    const isAcademic = await validateAcademicContent(photoUrl, contentType, description);

    if (!isAcademic) {
      return Response.json({ error: 'Content not approved for sharing - must be academic material only' }, { status: 400 });
    }

    // Add photo to session data
    const photoData = {
      url: photoUrl,
      uploadedBy: role,
      uploaderId: new ObjectId(userId),
      timestamp: new Date(),
      description: description || '',
      contentType: contentType || 'image/jpeg',
      isAcademic: true,
      downloadCount: 0,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours after session
    };

    await sessionsCollection.updateOne(
      { sessionId },
      {
        $push: {
          'sessionData.sharedPhotos': photoData
        }
      }
    );

    return Response.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: photoData,
      warning: 'Photo access expires after 24 hours'
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    return Response.json({ error: 'Failed to upload photo' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// GET - Get shared photos for session
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

    // Access control
    const isParticipant = 
      (role === 'student' && session.studentId.toString() === userId) ||
      (role === 'teacher' && session.teacherId.toString() === userId);

    if (!isParticipant) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Filter expired photos
    const now = new Date();
    const validPhotos = (session.sessionData?.sharedPhotos || []).filter(
      photo => !photo.expiresAt || new Date(photo.expiresAt) > now
    );

    // For teachers, disable download (read-only access)
    const photos = validPhotos.map(photo => ({
      ...photo,
      canDownload: role === 'student' // Only students can download
    }));

    return Response.json({
      photos,
      total: photos.length,
      message: role === 'teacher' 
        ? 'Photos available for viewing only (download disabled for teachers)'
        : 'Photos available for viewing and download'
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return Response.json({ error: 'Failed to fetch photos' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// DELETE - Delete photo
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { sessionId, userId, role, photoUrl } = body;

    if (!sessionId || !userId || !role || !photoUrl) {
      return Response.json({ error: 'sessionId, userId, role, and photoUrl required' }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Only the uploader can delete their photo
    const photo = session.sessionData?.sharedPhotos?.find(p => p.url === photoUrl);
    
    if (!photo) {
      return Response.json({ error: 'Photo not found' }, { status: 404 });
    }

    if (photo.uploadedBy !== role || photo.uploaderId.toString() !== userId) {
      return Response.json({ error: 'Only the uploader can delete this photo' }, { status: 403 });
    }

    // Remove photo from session
    await sessionsCollection.updateOne(
      { sessionId },
      {
        $pull: {
          'sessionData.sharedPhotos': { url: photoUrl }
        }
      }
    );

    // In production, delete actual file from storage

    return Response.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return Response.json({ error: 'Failed to delete photo' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// Content validation function
async function validateAcademicContent(photoUrl, contentType, description) {
  // In production, implement actual content validation:
  // - Use AI content moderation (AWS Rekognition, Google Vision API)
  // - Check for inappropriate content
  // - Validate it's academic material (textbook pages, notes, diagrams, etc.)
  // - Scan for personal information
  
  // For now, basic validation:
  if (!contentType || !contentType.startsWith('image/')) {
    return false;
  }

  // Check description for academic keywords
  const academicKeywords = [
    'homework', 'assignment', 'question', 'problem', 'solution',
    'formula', 'equation', 'diagram', 'graph', 'chart', 'notes',
    'textbook', 'chapter', 'exercise', 'example', 'proof'
  ];

  if (description) {
    const hasAcademicKeyword = academicKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
    if (hasAcademicKeyword) {
      return true;
    }
  }

  // Default to allow for development (in production, be stricter)
  return true;
}
