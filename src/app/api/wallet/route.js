import { MongoClient, ObjectId } from "mongodb";
import { getApiSession, isAdminSession } from "@/lib/api-auth";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

export async function GET(request) {
  const session = await getApiSession(request);
  if (!session) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");
  const userId = session.user.id;

  if (
    requestedUserId &&
    requestedUserId !== userId &&
    !isAdminSession(session)
  ) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const targetUserId =
    requestedUserId && isAdminSession(session) ? requestedUserId : userId;
  if (!ObjectId.isValid(targetUserId)) {
    return Response.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    await client.connect();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(targetUserId) },
        { projection: { wallet: 1 } },
      );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      balance: user.wallet?.balance || 0,
      currency: user.wallet?.currency || "BDT",
      transactions: user.wallet?.transactions || [],
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return Response.json(
      { error: "Failed to fetch wallet data" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  const session = await getApiSession(request);
  if (!session) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { amount, type, description, sessionId } = body;

    if (type !== "debit") {
      return Response.json(
        {
          error:
            "Wallet credits and refunds must use a verified payment or refund flow",
        },
        { status: 403 },
      );
    }

    const debitAmount = Number(amount);
    if (!Number.isFinite(debitAmount) || debitAmount <= 0) {
      return Response.json(
        { error: "A positive transaction amount is required" },
        { status: 400 },
      );
    }

    if (sessionId && !ObjectId.isValid(sessionId)) {
      return Response.json({ error: "Invalid session ID" }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection("users");
    const userObjectId = new ObjectId(session.user.id);
    if (sessionId) {
      const booking = await db.collection("sessions").findOne({
        _id: new ObjectId(sessionId),
        studentId: userObjectId,
      });
      if (!booking) {
        return Response.json({ error: "Session not found" }, { status: 404 });
      }
    }

    const transaction = {
      _id: new ObjectId(),
      type: "debit",
      amount: debitAmount,
      description:
        typeof description === "string"
          ? description.slice(0, 200)
          : "Wallet debit",
      sessionId: sessionId ? new ObjectId(sessionId) : null,
      createdAt: new Date(),
    };

    const updateResult = await usersCollection.updateOne(
      { _id: userObjectId, "wallet.balance": { $gte: debitAmount } },
      {
        $inc: { "wallet.balance": -debitAmount },
        $push: { "wallet.transactions": transaction },
      },
    );

    if (updateResult.matchedCount === 0) {
      const userExists = await usersCollection.findOne(
        { _id: userObjectId },
        { projection: { _id: 1 } },
      );
      return Response.json(
        {
          error: userExists ? "Insufficient wallet balance" : "User not found",
        },
        { status: userExists ? 400 : 404 },
      );
    }

    const updatedUser = await usersCollection.findOne(
      { _id: userObjectId },
      { projection: { "wallet.balance": 1 } },
    );

    return Response.json({
      success: true,
      balance: updatedUser.wallet.balance,
      transaction,
    });
  } catch (error) {
    console.error("Error processing wallet transaction:", error);
    return Response.json(
      { error: "Failed to process transaction" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
