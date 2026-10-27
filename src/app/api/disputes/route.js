import { MongoClient, ObjectId } from "mongodb";
import { getApiSession, isAdminSession } from "@/lib/api-auth";
import { applyCreditScoreChange } from "@/lib/credit-score";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

// GET - Get disputes for user or admin
export async function GET(request) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const status = searchParams.get("status");
    const userId = authSession.user.id;
    const isAdmin = isAdminSession(authSession);

    if (requestedUserId && requestedUserId !== userId && !isAdmin) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await client.connect();
    const disputesCollection = db.collection("disputes");

    const query = isAdmin
      ? {}
      : {
          $or: [
            { raisedBy: new ObjectId(userId) },
            { againstUser: new ObjectId(userId) },
          ],
        };

    if (status) {
      query.status = status;
    }

    const disputes = await disputesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(disputes);
  } catch (error) {
    console.error("Error fetching disputes:", error);
    return Response.json(
      { error: "Failed to fetch disputes" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// POST - Create new dispute
export async function POST(request) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { sessionId, raisedBy, againstUser, type, description, evidence } =
      body;

    if (!sessionId || !againstUser || !type || !description) {
      return Response.json(
        { error: "sessionId, againstUser, type, and description required" },
        { status: 400 },
      );
    }

    if (
      !ObjectId.isValid(againstUser) ||
      (raisedBy && raisedBy !== authSession.user.id)
    ) {
      return Response.json(
        { error: "Invalid dispute participants" },
        { status: 400 },
      );
    }

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.length > 5000
    ) {
      return Response.json(
        { error: "Dispute description must be between 1 and 5000 characters" },
        { status: 400 },
      );
    }

    if (!["payment", "behavior", "quality", "technical"].includes(type)) {
      return Response.json({ error: "Invalid dispute type" }, { status: 400 });
    }

    await client.connect();
    const disputesCollection = db.collection("disputes");
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const currentUserId = new ObjectId(authSession.user.id);
    const studentId = session.studentId;
    const teacher = await db
      .collection("teachers")
      .findOne({ _id: session.teacherId }, { projection: { userId: 1 } });
    const teacherUserId = teacher?.userId || session.teacherId;
    const isStudent = studentId?.toString() === currentUserId.toString();
    const isTeacher = teacherUserId?.toString() === currentUserId.toString();

    if (!isStudent && !isTeacher) {
      return Response.json(
        { error: "Only session participants can file a dispute" },
        { status: 403 },
      );
    }

    const expectedAgainstUser = isStudent ? teacherUserId : studentId;
    if (expectedAgainstUser?.toString() !== againstUser) {
      return Response.json(
        { error: "Dispute must name the other session participant" },
        { status: 400 },
      );
    }

    const existingDispute = await disputesCollection.findOne({
      sessionId: session._id,
    });
    if (existingDispute) {
      return Response.json(
        { error: "Dispute already exists for this session" },
        { status: 400 },
      );
    }

    // Create dispute
    const dispute = {
      sessionId: session._id,
      raisedBy: currentUserId,
      againstUser: new ObjectId(againstUser),
      type,
      description: description.trim(),
      evidence: Array.isArray(evidence) ? evidence.slice(0, 20) : [],
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await disputesCollection.insertOne(dispute);

    // Update session status to disputed
    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          status: "disputed",
          "dispute.status": "pending",
          "dispute.raisedBy": raisedBy,
          "dispute.reason": description,
        },
      },
    );

    return Response.json({
      success: true,
      dispute: { ...dispute, _id: result.insertedId },
      message:
        "Dispute submitted successfully. Our team will review within 24-48 hours.",
    });
  } catch (error) {
    console.error("Error creating dispute:", error);
    return Response.json(
      { error: "Failed to create dispute" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// PUT - Resolve dispute (admin only)
export async function PUT(request) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (!isAdminSession(authSession)) {
      return Response.json(
        { error: "Administrator access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { disputeId, action, amount, reason } = body;

    if (!disputeId || !ObjectId.isValid(disputeId) || !action) {
      return Response.json(
        { error: "A valid disputeId and action are required" },
        { status: 400 },
      );
    }

    if (
      !["refund", "partial_refund", "no_action", "penalty"].includes(action)
    ) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    await client.connect();
    const disputesCollection = db.collection("disputes");
    const sessionsCollection = db.collection("sessions");
    const usersCollection = db.collection("users");

    const dispute = await disputesCollection.findOne({
      _id: new ObjectId(disputeId),
    });

    if (!dispute) {
      return Response.json({ error: "Dispute not found" }, { status: 404 });
    }

    if (dispute.status !== "pending") {
      return Response.json(
        { error: "Dispute has already been resolved" },
        { status: 409 },
      );
    }

    const session = await sessionsCollection.findOne({
      _id: dispute.sessionId,
    });
    if (!session) {
      return Response.json(
        { error: "Disputed session not found" },
        { status: 404 },
      );
    }

    const paymentAmount = Number(session.payment?.amount);
    const refundAmount = action === "refund" ? paymentAmount : Number(amount);
    if (
      (action === "refund" &&
        (!Number.isFinite(paymentAmount) || paymentAmount <= 0)) ||
      (action === "partial_refund" &&
        (!Number.isFinite(refundAmount) ||
          refundAmount <= 0 ||
          refundAmount > paymentAmount))
    ) {
      return Response.json(
        {
          error:
            "Refund amount must be positive and cannot exceed the session payment",
        },
        { status: 400 },
      );
    }

    const resolution = {
      action,
      amount:
        action === "refund" || action === "partial_refund" ? refundAmount : 0,
      reason: typeof reason === "string" ? reason.slice(0, 1000) : "",
      resolvedBy: new ObjectId(authSession.user.id),
      resolvedAt: new Date(),
    };

    const resolutionResult = await disputesCollection.updateOne(
      { _id: new ObjectId(disputeId), status: "pending" },
      {
        $set: {
          status: "resolved",
          resolution,
          updatedAt: new Date(),
        },
      },
    );

    if (resolutionResult.modifiedCount === 0) {
      return Response.json(
        { error: "Dispute has already been resolved" },
        { status: 409 },
      );
    }

    // Handle resolution actions
    if (action === "refund" || action === "partial_refund") {
      await usersCollection.updateOne(
        { _id: session.studentId },
        {
          $inc: { "wallet.balance": refundAmount },
          $push: {
            "wallet.transactions": {
              _id: new ObjectId(),
              type: "refund",
              amount: refundAmount,
              description: `Dispute refund: ${resolution.reason}`,
              sessionId: session._id,
              createdAt: new Date(),
            },
          },
        },
      );

      if (action === "refund") {
        await usersCollection.updateOne(
          { _id: session.teacherId },
          {
            $inc: {
              "earnings.available": -paymentAmount,
              "earnings.total": -paymentAmount,
            },
          },
        );
      }
    }

    // Update session status
    const newSessionStatus = action === "penalty" ? "cancelled" : "completed";
    await sessionsCollection.updateOne(
      { _id: dispute.sessionId },
      {
        $set: {
          status: newSessionStatus,
          "dispute.status": "resolved",
          "dispute.resolution": resolution,
        },
      },
    );

    // Update credit scores based on resolution
    if (action === "penalty") {
      await applyCreditScoreChange({
        usersCollection,
        teachersCollection: db.collection("teachers"),
        teacherId: dispute.againstUser,
        action: "dispute_lost",
        sessionId: dispute.sessionId,
        reason: `Dispute resolved with penalty: ${resolution.reason}`,
      });
    } else if (action === "no_action") {
      await applyCreditScoreChange({
        usersCollection,
        teachersCollection: db.collection("teachers"),
        teacherId: dispute.againstUser,
        action: "dispute_won",
        sessionId: dispute.sessionId,
        reason: "Dispute resolved in teacher favor",
      });
    }

    return Response.json({
      success: true,
      message: "Dispute resolved successfully",
      resolution,
    });
  } catch (error) {
    console.error("Error resolving dispute:", error);
    return Response.json(
      { error: "Failed to resolve dispute" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
