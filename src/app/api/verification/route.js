import { MongoClient, ObjectId } from "mongodb";
import { getApiSession, isAdminSession } from "@/lib/api-auth";

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("edu-flex");

// GET - Get verification status
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
    const userId = authSession.user.id;

    if (
      requestedUserId &&
      requestedUserId !== userId &&
      !isAdminSession(authSession)
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await client.connect();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne(
      {
        _id: new ObjectId(
          requestedUserId && isAdminSession(authSession)
            ? requestedUserId
            : userId,
        ),
      },
      { projection: { verificationStatus: 1, verificationDocuments: 1 } },
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      status: user.verificationStatus || "pending",
      documents: user.verificationDocuments || null,
    });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    return Response.json(
      { error: "Failed to fetch verification status" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// POST - Submit verification documents
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
    const { userId, nidNumber, nidImage, credentials } = body;

    if (userId && userId !== authSession.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!nidNumber || !nidImage) {
      return Response.json(
        { error: "nidNumber and nidImage are required" },
        { status: 400 },
      );
    }

    if (
      typeof nidNumber !== "string" ||
      nidNumber.length > 100 ||
      typeof nidImage !== "string" ||
      nidImage.length > 2_000_000 ||
      (credentials !== undefined && !Array.isArray(credentials))
    ) {
      return Response.json(
        { error: "Invalid verification document data" },
        { status: 400 },
      );
    }

    await client.connect();
    const usersCollection = db.collection("users");
    const teachersCollection = db.collection("teachers");
    const verifiedUserId = new ObjectId(authSession.user.id);

    // Update user verification documents
    const verificationDocuments = {
      nidNumber,
      nidImage,
      credentials: credentials || [],
      submittedAt: new Date(),
    };

    await usersCollection.updateOne(
      { _id: verifiedUserId },
      {
        $set: {
          verificationStatus: "pending",
          verificationDocuments,
        },
      },
    );

    // Update teacher profile status if exists
    const teacher = await teachersCollection.findOne({
      userId: verifiedUserId,
    });
    if (teacher) {
      await teachersCollection.updateOne(
        { userId: verifiedUserId },
        { $set: { status: "pending" } },
      );
    }

    return Response.json({
      success: true,
      message:
        "Verification documents submitted successfully. Our team will review within 24-48 hours.",
    });
  } catch (error) {
    console.error("Error submitting verification:", error);
    return Response.json(
      { error: "Failed to submit verification documents" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}

// PUT - Admin: Approve/Reject verification
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
    const { userId, action, reason } = body;

    if (!userId || !ObjectId.isValid(userId) || !action) {
      return Response.json(
        { error: "A valid userId and action are required" },
        { status: 400 },
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    await client.connect();
    const usersCollection = db.collection("users");
    const teachersCollection = db.collection("teachers");

    const newStatus = action === "approve" ? "verified" : "rejected";

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          verificationStatus: newStatus,
          "verificationDocuments.reviewedAt": new Date(),
          "verificationDocuments.reviewReason": reason || "",
        },
      },
    );

    // Update teacher profile status
    if (action === "approve") {
      await teachersCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { status: "approved" } },
      );
    } else {
      await teachersCollection.updateOne(
        { userId: new ObjectId(userId) },
        { $set: { status: "suspended" } },
      );
    }

    return Response.json({
      success: true,
      status: newStatus,
      message:
        action === "approve"
          ? "Teacher verified successfully"
          : "Teacher verification rejected",
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return Response.json(
      { error: "Failed to update verification status" },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
