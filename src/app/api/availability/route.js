import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db('edu-flex');

// GET - Get teacher availability
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const date = searchParams.get('date'); // YYYY-MM-DD format

    if (!teacherId) {
      return Response.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    await client.connect();
    const availabilityCollection = db.collection('availability_slots');
    const teachersCollection = db.collection('teachers');

    // Get teacher profile with availability settings
    const teacher = await teachersCollection.findOne(
      { _id: new ObjectId(teacherId) },
      { projection: { availability: 1, userId: 1 } }
    );

    if (!teacher) {
      return Response.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get specific date slots if date provided
    let slots = [];
    if (date) {
      const queryDate = new Date(date);
      slots = await availabilityCollection.findOne({
        teacherId: new ObjectId(teacherId),
        date: queryDate
      });
    }

    return Response.json({
      isActive: teacher.availability?.isActive || true,
      instantAvailability: teacher.availability?.instantAvailability || {
        enabled: false,
        currentStatus: 'offline',
        lastUpdated: new Date()
      },
      regularSlots: teacher.availability?.regularSlots || [],
      dateSlots: slots?.slots || []
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return Response.json({ error: 'Failed to fetch availability' }, { status: 500 });
  } finally {
    await client.close();
  }
}

// POST - Set teacher availability
export async function POST(request) {
  try {
    const body = await request.json();
    const { teacherId, action, data } = body;

    if (!teacherId || !action) {
      return Response.json({ error: 'Teacher ID and action required' }, { status: 400 });
    }

    await client.connect();
    const teachersCollection = db.collection('teachers');
    const availabilityCollection = db.collection('availability_slots');

    switch (action) {
      case 'toggle_status':
        // Toggle teacher active/inactive status
        const updatedTeacher = await teachersCollection.updateOne(
          { _id: new ObjectId(teacherId) },
          {
            $set: {
              'availability.isActive': data.isActive,
              'availability.instantAvailability.currentStatus': data.isActive ? 'available' : 'offline',
              'availability.instantAvailability.lastUpdated': new Date()
            }
          }
        );
        break;

      case 'set_instant_status':
        // Set instant availability status
        await teachersCollection.updateOne(
          { _id: new ObjectId(teacherId) },
          {
            $set: {
              'availability.instantAvailability.enabled': data.enabled,
              'availability.instantAvailability.currentStatus': data.status,
              'availability.instantAvailability.lastUpdated': new Date()
            }
          }
        );
        break;

      case 'add_regular_slot':
        // Add regular weekly availability slot
        await teachersCollection.updateOne(
          { _id: new ObjectId(teacherId) },
          {
            $push: {
              'availability.regularSlots': {
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                isShiftBased: data.isShiftBased || false
              }
            }
          }
        );
        break;

      case 'remove_regular_slot':
        // Remove regular weekly availability slot
        await teachersCollection.updateOne(
          { _id: new ObjectId(teacherId) },
          {
            $pull: {
              'availability.regularSlots': {
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime
              }
            }
          }
        );
        break;

      case 'set_date_slots':
        // Set specific date availability slots
        const queryDate = new Date(data.date);
        queryDate.setHours(0, 0, 0, 0);

       await availabilityCollection.updateOne(
          {
            teacherId: new ObjectId(teacherId),
            date: queryDate
          },
          {
            $set: {
              slots: data.slots,
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );
        break;

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error setting availability:', error);
    return Response.json({ error: 'Failed to set availability' }, { status: 500 });
  } finally {
    await client.close();
  }
}
