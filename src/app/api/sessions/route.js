import { MongoClient, ObjectId } from "mongodb";
import { getApiSession, isAdminSession } from "@/lib/api-auth";
import { applyCreditScoreChange } from "@/lib/credit-score";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

// GET - Get sessions for a user
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

    if (
      requestedUserId &&
      requestedUserId !== userId &&
      !isAdminSession(authSession)
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await client.connect();
    const sessionsCollection = db.collection("sessions");

    let query;
    if (isAdminSession(authSession)) {
      query = {};
    } else if (authSession.user.role === "student") {
      query = { studentId: new ObjectId(userId) };
    } else if (authSession.user.role === "teacher") {
      const teacher = await db
        .collection("teachers")
        .findOne({ userId: new ObjectId(userId) }, { projection: { _id: 1 } });
      if (!teacher) {
        return Response.json(
          { error: "Teacher profile not found" },
          { status: 404 },
        );
      }
      query = { teacherId: teacher._id };
    } else {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status) {
      query.status = status;
    }

    const sessions = await sessionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// POST - Create new session booking
export async function POST(request) {
  try {
    const authSession = await getApiSession(request);
    if (!authSession) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    if (authSession.user.role !== "student") {
      return Response.json(
        { error: "Only students can book sessions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      studentId,
      teacherId,
      type,
      subject,
      topic,
      duration,
      rateType,
      rate,
      scheduledTime,
    } = body;

    if (
      !studentId ||
      !teacherId ||
      !subject ||
      !topic ||
      !duration ||
      !rateType ||
      !rate
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      studentId !== authSession.user.id ||
      !ObjectId.isValid(studentId) ||
      !ObjectId.isValid(teacherId) ||
      !Number.isFinite(Number(rate)) ||
      Number(rate) <= 0 ||
      !Number.isFinite(Number(duration)) ||
      Number(duration) <= 0 ||
      !["hourly", "fixed"].includes(rateType) ||
      (type !== "instant" && type !== "scheduled")
    ) {
      return Response.json(
        { error: "Invalid session booking details" },
        { status: 400 },
      );
    }

    await client.connect();
    const usersCollection = db.collection("users");
    const teachersCollection = db.collection("teachers");
    const sessionsCollection = db.collection("sessions");

    // Check student wallet balance
    const student = await usersCollection.findOne(
      { _id: new ObjectId(studentId) },
      {
        projection: {
          wallet: 1,
          firstSessionDiscountUsed: 1,
          discountPairings: 1,
        },
      },
    );

    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    // Check teacher availability and status
    const teacher = await teachersCollection.findOne(
      { _id: new ObjectId(teacherId) },
      { projection: { availability: 1, status: 1, userId: 1 } },
    );

    if (!teacher || teacher.status !== "approved") {
      return Response.json({ error: "Teacher not available" }, { status: 400 });
    }

    if (!teacher.availability?.isActive) {
      return Response.json(
        { error: "Teacher is currently inactive" },
        { status: 400 },
      );
    }

    // For instant sessions, check if teacher is available now
    if (
      type === "instant" &&
      !teacher.availability?.instantAvailability?.enabled
    ) {
      return Response.json(
        { error: "Teacher not available for instant sessions" },
        { status: 400 },
      );
    }

    // Calculate cost with discount
    let totalCost = Number(rate);
    let discountApplied = 0;
    let discountType = "none";

    // Check for first session discount (50% off)
    if (!student.firstSessionDiscountUsed) {
      // Check if this student has used discount with this teacher before
      const hasPairedBefore = student.discountPairings?.some(
        (pairing) => pairing.teacherId.toString() === teacherId.toString(),
      );

      if (!hasPairedBefore) {
        discountApplied = totalCost * 0.5;
        totalCost = totalCost * 0.5;
        discountType = "first_session";
      }
    }

    // Check wallet balance
    const currentBalance = student.wallet?.balance || 0;
    if (currentBalance < totalCost) {
      return Response.json(
        {
          error: "Insufficient balance",
          required: totalCost,
          available: currentBalance,
        },
        { status: 400 },
      );
    }

    // Generate unique session ID
    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create session
    const session = {
      sessionId,
      studentId: new ObjectId(studentId),
      teacherId: new ObjectId(teacherId),
      type,
      subject,
      topic,
      duration,
      rateType,
      rate,
      totalCost,
      scheduledTime:
        type === "scheduled" ? new Date(scheduledTime) : new Date(),
      bookingTime: new Date(),
      status: "confirmed",
      joinTracking: {
        teacherJoinedAt: null,
        studentJoinedAt: null,
        teacherOnTime: false,
        studentOnTime: false,
      },
      payment: {
        status: "paid",
        amount: totalCost,
        discountApplied,
        discountType,
        transactionId: null,
      },
      sessionData: {
        recordingUrl: null,
        whiteboardData: {},
        sharedPhotos: [],
      },
      review: null,
      dispute: {
        status: "none",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await sessionsCollection.insertOne(session);

    const transaction = {
      _id: new ObjectId(),
      type: "debit",
      amount: totalCost,
      description: `Session booking: ${subject} - ${topic}`,
      sessionId: result.insertedId,
      createdAt: new Date(),
    };

    const debitResult = await usersCollection.updateOne(
      { _id: new ObjectId(studentId), "wallet.balance": { $gte: totalCost } },
      {
        $inc: { "wallet.balance": -totalCost },
        $push: { "wallet.transactions": transaction },
      },
    );
    if (debitResult.modifiedCount === 0) {
      await sessionsCollection.deleteOne({ _id: result.insertedId });
      return Response.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Update first session discount if used
    if (discountType === "first_session") {
      await usersCollection.updateOne(
        { _id: new ObjectId(studentId) },
        {
          $set: { firstSessionDiscountUsed: true },
          $push: {
            discountPairings: {
              teacherId: new ObjectId(teacherId),
              usedAt: new Date(),
            },
          },
        },
      );
    }

    // For instant sessions, set timeout for teacher join
    if (type === "instant") {
      setTimeout(
        async () => {
          try {
            const updatedSession = await sessionsCollection.findOne({
              _id: result.insertedId,
            });

            if (
              updatedSession.status === "confirmed" &&
              !updatedSession.joinTracking.teacherJoinedAt
            ) {
              // Teacher didn't join within 5 minutes - refund and cancel
              await sessionsCollection.updateOne(
                { _id: result.insertedId },
                { $set: { status: "cancelled" } },
              );

              // Refund student
              await usersCollection.updateOne(
                { _id: new ObjectId(studentId) },
                {
                  $inc: { "wallet.balance": totalCost },
                  $push: {
                    "wallet.transactions": {
                      _id: new ObjectId(),
                      type: "refund",
                      amount: totalCost,
                      description:
                        "Refund: Teacher did not join within 5 minutes",
                      sessionId: result.insertedId,
                      createdAt: new Date(),
                    },
                  },
                },
              );

              // Penalize teacher credit score
              await applyCreditScoreChange({
                usersCollection,
                teachersCollection,
                teacherId: teacher.userId,
                action: "no_show",
                sessionId: result.insertedId,
                reason: "Did not join instant session within 5 minutes",
              });
            }
          } catch (error) {
            console.error("Error handling instant session timeout:", error);
          }
        },
        5 * 60 * 1000,
      ); // 5 minutes
    }

    return Response.json({
      success: true,
      session: { ...session, _id: result.insertedId },
      message:
        type === "instant"
          ? "Session booked! Teacher will join within 5 minutes."
          : "Session scheduled successfully.",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
