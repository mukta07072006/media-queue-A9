import { ObjectId } from "mongodb";

const scoreChanges = {
  on_time: 2,
  late: -5,
  no_show: -20,
  dispute_won: 5,
  dispute_lost: -10,
  session_completed: 1,
  session_cancelled: -3,
};

export function isCreditScoreAction(action) {
  return Object.hasOwn(scoreChanges, action);
}

export async function applyCreditScoreChange({
  usersCollection,
  teachersCollection,
  teacherId,
  action,
  sessionId,
  reason,
}) {
  if (!ObjectId.isValid(String(teacherId)) || !isCreditScoreAction(action)) {
    throw new Error("Invalid credit score update");
  }

  const teacherObjectId =
    teacherId instanceof ObjectId ? teacherId : new ObjectId(teacherId);
  const user = await usersCollection.findOne(
    { _id: teacherObjectId },
    { projection: { creditScore: 1 } },
  );

  if (!user) {
    return null;
  }

  const currentScore = user.creditScore?.score ?? 100;
  const scoreChange = scoreChanges[action];
  const newScore = Math.max(0, Math.min(100, currentScore + scoreChange));
  const historyEntry = {
    sessionId:
      sessionId && ObjectId.isValid(String(sessionId))
        ? sessionId instanceof ObjectId
          ? sessionId
          : new ObjectId(sessionId)
        : null,
    action,
    scoreChange,
    newScore,
    timestamp: new Date(),
    reason:
      typeof reason === "string"
        ? reason.slice(0, 1000)
        : `Score change due to ${action}`,
  };

  await usersCollection.updateOne(
    { _id: teacherObjectId },
    {
      $set: { "creditScore.score": newScore },
      $push: { "creditScore.history": historyEntry },
    },
  );

  if (newScore < 50) {
    await teachersCollection.updateOne(
      { userId: teacherObjectId },
      { $set: { status: "suspended" } },
    );
  }

  return {
    previousScore: currentScore,
    newScore,
    scoreChange,
    status: newScore < 50 ? "suspended" : newScore < 70 ? "warning" : "good",
  };
}
