import { MongoClient, ObjectId } from "mongodb";
import { getApiSession, isAdminSession } from "@/lib/api-auth";
import {
  applyCreditScoreChange,
  isCreditScoreAction,
} from "@/lib/credit-score";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

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
    const requestedTeacherId = searchParams.get("teacherId");
    const teacherId = authSession.user.id;

    if (
      requestedTeacherId &&
      requestedTeacherId !== teacherId &&
      !isAdminSession(authSession)
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!ObjectId.isValid(requestedTeacherId || teacherId)) {
      return Response.json({ error: "Invalid teacher ID" }, { status: 400 });
    }

    await client.connect();
    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(
          requestedTeacherId && isAdminSession(authSession)
            ? requestedTeacherId
            : teacherId,
        ),
      },
      { projection: { creditScore: 1 } },
    );

    if (!user) {
      return Response.json({ error: "Teacher not found" }, { status: 404 });
    }

    return Response.json({
      score: user.creditScore?.score ?? 100,
      history: user.creditScore?.history || [],
    });
  } catch (error) {
    console.error("Error fetching credit score:", error);
    return Response.json(
      { error: "Failed to fetch credit score" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

export async function POST(request) {
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
    const { teacherId, action, sessionId, reason } = body;

    if (!teacherId || !ObjectId.isValid(teacherId) || !action) {
      return Response.json(
        { error: "A valid teacherId and action are required" },
        { status: 400 },
      );
    }
    if (!isCreditScoreAction(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }
    if (sessionId && !ObjectId.isValid(sessionId)) {
      return Response.json({ error: "Invalid session ID" }, { status: 400 });
    }

    await client.connect();
    const result = await applyCreditScoreChange({
      usersCollection: db.collection("users"),
      teachersCollection: db.collection("teachers"),
      teacherId,
      action,
      sessionId,
      reason,
    });

    if (!result) {
      return Response.json({ error: "Teacher not found" }, { status: 404 });
    }

    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error("Error updating credit score:", error);
    return Response.json(
      { error: "Failed to update credit score" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
