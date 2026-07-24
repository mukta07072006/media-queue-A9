import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Fetch all tutors with optional filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await client.connect();
    const collection = db.collection('tutors');

    let query = { status: 'approved' };

    // Add search filter if provided
    if (search) {
      query.$or = [
        { tutorName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Add date filters if provided
    if (startDate) {
      query.sessionStartDate = { ...query.sessionStartDate, $gte: new Date(startDate) };
    }
    if (endDate) {
      query.sessionEndDate = { ...query.sessionEndDate, $lte: new Date(endDate) };
    }

    const tutors = await collection.find(query).toArray();

    return Response.json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    return Response.json({ error: 'Failed to fetch tutors' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Create a new tutor
export async function POST(request) {
  try {
    const body = await request.json();

    await client.connect();
    const collection = db.collection('tutors');

    // Create new tutor document
    const newTutor = {
      ...body,
      status: 'pending', // Default status for new tutors
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newTutor);

    return Response.json(
      { ...newTutor, _id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tutor:', error);
    return Response.json({ error: 'Failed to create tutor' }, { status: 500 });
  } finally {
    await client.close();
  }
}
