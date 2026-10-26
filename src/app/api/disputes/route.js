import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get disputes for user or admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role'); // 'user' or 'admin'
    const status = searchParams.get('status');

    if (!userId || !role) {
      return Response.json({ error: 'userId and role required' }, { status: 400 });
    }

    await client.connect();
    const disputesCollection = db.collection('disputes');

    let query = {};
    if (role === 'user') {
      query.raisedBy = new ObjectId(userId);
    }
    
    if (status) {
      query.status = status;
    }

    const disputes = await disputesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(disputes);
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return Response.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Create new dispute
export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, raisedBy, againstUser, type, description, evidence } = body;

    if (!sessionId || !raisedBy || !againstUser || !type || !description) {
      return Response.json({ error: 'sessionId, raisedBy, againstUser, type, and description required' }, { status: 400 });
    }

    if (!['payment', 'behavior', 'quality', 'technical'].includes(type)) {
      return Response.json({ error: 'Invalid dispute type' }, { status: 400 });
    }

    await client.connect();
    const disputesCollection = db.collection('disputes');
    const sessionsCollection = db.collection('sessions');

    // Check if session exists
    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if dispute already exists for this session
    const existingDispute = await disputesCollection.findOne({ sessionId: session._id });
    if (existingDispute) {
      return Response.json({ error: 'Dispute already exists for this session' }, { status: 400 });
    }

    // Create dispute
    const dispute = {
      sessionId: session._id,
      raisedBy: new ObjectId(raisedBy),
      againstUser: new ObjectId(againstUser),
      type,
      description,
      evidence: evidence || [],
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await disputesCollection.insertOne(dispute);

    // Update session status to disputed
    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          status: 'disputed',
          'dispute.status': 'pending',
          'dispute.raisedBy': raisedBy,
          'dispute.reason': description
        }
      }
    );

    return Response.json({
      success: true,
      dispute: { ...dispute, _id: result.insertedId },
      message: 'Dispute submitted successfully. Our team will review within 24-48 hours.'
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return Response.json({ error: 'Failed to create dispute' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// PUT - Resolve dispute (admin only)
export async function PUT(request) {
  try {
    const body = await request.json();
    const { disputeId, action, amount, reason, resolvedBy } = body;

    if (!disputeId || !action || !resolvedBy) {
      return Response.json({ error: 'disputeId, action, and resolvedBy required' }, { status: 400 });
    }

    if (!['refund', 'partial_refund', 'no_action', 'penalty'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    await client.connect();
    const disputesCollection = db.collection('disputes');
    const sessionsCollection = db.collection('sessions');
    const usersCollection = db.collection('users');

    const dispute = await disputesCollection.findOne({ _id: new ObjectId(disputeId) });

    if (!dispute) {
      return Response.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const resolution = {
      action,
      amount: amount || 0,
      reason: reason || '',
      resolvedBy: new ObjectId(resolvedBy),
      resolvedAt: new Date()
    };

    // Update dispute status
    await disputesCollection.updateOne(
      { _id: new ObjectId(disputeId) },
      {
        $set: {
          status: 'resolved',
          resolution,
          updatedAt: new Date()
        }
      }
    );

    // Handle resolution actions
    if (action === 'refund' || action === 'partial_refund') {
      // Get session details
      const session = await sessionsCollection.findOne({ _id: dispute.sessionId });
      
      if (session) {
        const refundAmount = action === 'refund' ? session.payment.amount : amount;
        
        // Refund student
        await usersCollection.updateOne(
          { _id: session.studentId },
          {
            $inc: { 'wallet.balance': refundAmount },
            $push: {
              'wallet.transactions': {
                _id: new ObjectId(),
                type: 'refund',
                amount: refundAmount,
                description: `Dispute refund: ${reason}`,
                sessionId: session._id,
                createdAt: new Date()
              }
            }
          }
        );

        // Deduct from teacher earnings if applicable
        if (action === 'refund') {
          await usersCollection.updateOne(
            { _id: session.teacherId },
            {
              $inc: { 
                'earnings.available': -session.payment.amount,
                'earnings.total': -session.payment.amount
              }
          }
        );
      }
    }

    // Update session status
    const newSessionStatus = action === 'penalty' ? 'cancelled' : 'completed';
    await sessionsCollection.updateOne(
      { _id: dispute.sessionId },
      {
        $set: {
          status: newSessionStatus,
          'dispute.status': 'resolved',
          'dispute.resolution': resolution
        }
      }
    );

    // Update credit scores based on resolution
    if (action === 'penalty') {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/credit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: dispute.againstUser,
          action: 'dispute_lost',
          sessionId: dispute.sessionId,
          reason: `Dispute resolved with penalty: ${reason}`
        })
      });
    } else if (action === 'no_action') {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/credit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: dispute.againstUser,
          action: 'dispute_won',
          sessionId: dispute.sessionId,
          reason: 'Dispute resolved in teacher favor'
        })
      });
    }

    return Response.json({
      success: true,
      message: 'Dispute resolved successfully',
      resolution
    });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    return Response.json({ error: 'Failed to resolve dispute' }, { status: 500 });
  } finally {
    await client.close();
  }
}
