import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get teacher credit score
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return Response.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { _id: new ObjectId(teacherId) },
      { projection: { creditScore: 1, name: 1 } }
    );

    if (!user) {
      return Response.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return Response.json({
      score: user.creditScore?.score || 100,
      history: user.creditScore?.history || []
    });
  } catch (error) {
    console.error('Error fetching credit score:', error);
    return Response.json({ error: 'Failed to fetch credit score' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Update credit score
export async function POST(request) {
  try {
    const body = await request.json();
    const { teacherId, action, sessionId, reason } = body;

    if (!teacherId || !action) {
      return Response.json({ error: 'Teacher ID and action required' }, { status: 400 });
    }

    // Define score changes
    const scoreChanges = {
      on_time: 2,
      late: -5,
      no_show: -20,
      dispute_won: 5,
      dispute_lost: -10,
      session_completed: 1,
      session_cancelled: -3
    };

    if (!scoreChanges[action]) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');

    // Get current score
    const user = await usersCollection.findOne(
      { _id: new ObjectId(teacherId) },
      { projection: { creditScore: 1 } }
    );

    if (!user) {
      return Response.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const currentScore = user.creditScore?.score || 100;
    const scoreChange = scoreChanges[action];
    const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));

    // Create history entry
    const historyEntry = {
      sessionId: sessionId ? new ObjectId(sessionId) : null,
      action,
      scoreChange,
      newScore,
      timestamp: new Date(),
      reason: reason || `Score change due to ${action}`
    };

    // Update score
    await usersCollection.updateOne(
      { _id: new ObjectId(teacherId) },
      {
        $set: {
          'creditScore.score': newScore
        },
        $push: {
          'creditScore.history': historyEntry
        },
        $setOnInsert: {
          creditScore: {
            score: newScore,
            history: [historyEntry]
          }
        }
      },
      { upsert: true }
    );

    // Check if score is low and update teacher status
    if (newScore < 50) {
      await db.collection('teachers').updateOne(
        { userId: new ObjectId(teacherId) },
        { $set: { status: 'suspended' } }
      );
    } else if (newScore < 70) {
      // Warning status could be handled separately
    }

    return Response.json({
      success: true,
      previousScore: currentScore,
      newScore,
      scoreChange,
      status: newScore < 50 ? 'suspended' : newScore < 70 ? 'warning' : 'good'
    });
  } catch (error) {
    console.error('Error updating credit score:', error);
    return Response.json({ error: 'Failed to update credit score' }, { status: 500 });
  } finally {
    await client.close();
  }
}
