import { MongoClient, ObjectId } from "mongodb";
import { getApiSession } from "@/lib/api-auth";
import { applyCreditScoreChange } from "@/lib/credit-score";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

async function getParticipantRole(session, userId, teachersCollection) {
  if (session.studentId?.toString() === userId) return "student";
  if (session.teacherId?.toString() === userId) return "teacher";

  const teacher = await teachersCollection.findOne(
    { _id: session.teacherId, userId: new ObjectId(userId) },
    { projection: { _id: 1 } },
  );
  return teacher ? "teacher" : null;
}

// GET - Get video session details
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
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    await client.connect();
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne(
      { sessionId },
      { projection: { sessionData: 1, status: 1, studentId: 1, teacherId: 1 } },
    );

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const role = await getParticipantRole(
      session,
      authSession.user.id,
      db.collection("teachers"),
    );
    if (!role) {
      return Response.json(
        { error: "Only session participants can access this session" },
        { status: 403 },
      );
    }

    return Response.json({
      sessionId: session.sessionId,
      status: session.status,
      recordingUrl: session.sessionData?.recordingUrl,
      whiteboardData: session.sessionData?.whiteboardData,
      sharedPhotos: session.sessionData?.sharedPhotos,
    });
  } catch (error) {
    console.error("Error fetching video session:", error);
    return Response.json(
      { error: "Failed to fetch video session" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// POST - Create/join video session
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
    const { sessionId, userId, recordingConsent } = body;

    if (!sessionId || (userId && userId !== authSession.user.id)) {
      return Response.json(
        { error: "A valid sessionId is required" },
        { status: 400 },
      );
    }

    await client.connect();
    const sessionsCollection = db.collection("sessions");

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const role = await getParticipantRole(
      session,
      authSession.user.id,
      db.collection("teachers"),
    );
    if (!role) {
      return Response.json(
        { error: "Only session participants can join this session" },
        { status: 403 },
      );
    }

    // Update join tracking
    const updateField =
      role === "teacher"
        ? "joinTracking.teacherJoinedAt"
        : "joinTracking.studentJoinedAt";

    await sessionsCollection.updateOne(
      { sessionId },
      {
        $set: {
          [updateField]: new Date(),
          "sessionData.recordingConsent": recordingConsent === true,
        },
      },
    );

    // Check if both joined and update status
    const updatedSession = await sessionsCollection.findOne({ sessionId });
    if (
      updatedSession?.joinTracking?.teacherJoinedAt &&
      updatedSession?.joinTracking?.studentJoinedAt
    ) {
      await sessionsCollection.updateOne(
        { sessionId },
        {
          $set: {
            status: "in_progress",
            actualStartTime: new Date(),
          },
        },
      );
    }

    // Generate video token (placeholder - integrate with real video SDK)
    const videoToken = generateVideoToken(sessionId, authSession.user.id, role);

    return Response.json({
      success: true,
      sessionId,
      videoToken,
      role,
      recordingEnabled: recordingConsent === true,
      message: "Video session initialized successfully",
    });
  } catch (error) {
    console.error("Error creating video session:", error);
    return Response.json(
      { error: "Failed to create video session" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// PUT - End video session
export async function PUT(request) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { sessionId, userId, recordingUrl, whiteboardData } = body;

    if (!sessionId || (userId && userId !== authSession.user.id)) {
      return Response.json(
        { error: "A valid sessionId is required" },
        { status: 400 },
      );
    }

    await client.connect();
    const sessionsCollection = db.collection("sessions");
    const usersCollection = db.collection("users");

    const session = await sessionsCollection.findOne({ sessionId });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const role = await getParticipantRole(
      session,
      authSession.user.id,
      db.collection("teachers"),
    );
    if (role !== "teacher") {
      return Response.json(
        { error: "Only the session teacher can end the session" },
        { status: 403 },
      );
    }
    if (
      (recordingUrl !== undefined &&
        recordingUrl !== null &&
        (typeof recordingUrl !== "string" || recordingUrl.length > 2000)) ||
      (whiteboardData !== undefined &&
        (typeof whiteboardData !== "object" ||
          whiteboardData === null ||
          Array.isArray(whiteboardData)))
    ) {
      return Response.json({ error: "Invalid session data" }, { status: 400 });
    }

    if (session.status !== "in_progress") {
      return Response.json(
        { error: "Only in-progress sessions can be ended" },
        { status: 409 },
      );
    }

    // Update session data
    const updateData = {
      status: "completed",
      actualEndTime: new Date(),
      "sessionData.recordingUrl": recordingUrl || null,
      "sessionData.whiteboardData": whiteboardData || {},
    };

    const completionResult = await sessionsCollection.updateOne(
      { sessionId, status: "in_progress" },
      { $set: updateData },
    );
    if (completionResult.modifiedCount === 0) {
      return Response.json(
        { error: "Session has already ended" },
        { status: 409 },
      );
    }

    // Calculate session duration and update teacher credit score
    if (session.actualStartTime) {
      const duration = Math.floor(
        (new Date() - new Date(session.actualStartTime)) / 1000 / 60,
      ); // minutes

      // Update teacher credit score for completed session
      await applyCreditScoreChange({
        usersCollection,
        teachersCollection: db.collection("teachers"),
        teacherId: session.teacherId,
        action: "session_completed",
        sessionId: session._id,
        reason: `Completed ${duration} minute session`,
      });

      // Pay teacher
      const teacher = await usersCollection.findOne(
        { _id: session.teacherId },
        { projection: { earnings: 1 } },
      );

      if (teacher) {
        await usersCollection.updateOne(
          { _id: session.teacherId },
          {
            $inc: {
              "earnings.total": session.payment.amount,
              "earnings.available": session.payment.amount,
            },
          },
        );
      }
    }

    return Response.json({
      success: true,
      status: "completed",
      message: "Video session ended successfully",
    });
  } catch (error) {
    console.error("Error ending video session:", error);
    return Response.json(
      { error: "Failed to end video session" },
      { status: 500 },
    );
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
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
  };
}
