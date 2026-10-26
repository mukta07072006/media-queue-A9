import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get wallet balance and transactions
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
      { projection: { wallet: 1, name: 1, email: 1 } }
    );

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      balance: user.wallet?.balance || 0,
      currency: user.wallet?.currency || 'BDT',
      transactions: user.wallet?.transactions || []
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return Response.json({ error: 'Failed to fetch wallet data' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Recharge wallet or add transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, amount, type, description, sessionId } = body;

    if (!userId || !amount || !type) {
      return Response.json({ error: 'userId, amount, and type are required' }, { status: 400 });
    }

    if (!['credit', 'debit', 'refund', 'bonus'].includes(type)) {
      return Response.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection('users');

    const transaction = {
      _id: new ObjectId(),
      type,
      amount: parseFloat(amount),
      description: description || `${type} transaction`,
      sessionId: sessionId ? new ObjectId(sessionId) : null,
      createdAt: new Date()
    };

    const updateResult = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $setOnInsert: {
          wallet: {
            balance: 0,
            currency: 'BDT',
            transactions: []
          }
        },
        $inc: {
          'wallet.balance': type === 'credit' || type === 'refund' || type === 'bonus' 
            ? parseFloat(amount) 
            : -parseFloat(amount)
        },
        $push: {
          'wallet.transactions': transaction
        }
      },
      { upsert: true }
    );

    if (updateResult.matchedCount === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get updated wallet
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { wallet: 1 } }
    );

    return Response.json({
      success: true,
      balance: updatedUser.wallet.balance,
      transaction
    });
  } catch (error) {
    console.error('Error processing wallet transaction:', error);
    return Response.json({ error: 'Failed to process transaction' }, { status: 500 });
  } finally {
    await client.close();
  }
}
